# Health Connect 연동 개발 가이드

Android Health Connect를 통해 실제 걸음수를 읽어 운동 기록의 정확도를 높이는 기능에 대한 구현 과정과 트러블슈팅을 정리한 문서입니다.

---

## 목차

1. [패키지 선택 과정](#1-패키지-선택-과정)
2. [minSdkVersion 변경](#2-minsdkversion-변경)
3. [Android 설정](#3-android-설정)
4. [동작 흐름](#4-동작-흐름)
5. [코드 구조](#5-코드-구조)
6. [크래시 원인과 해결](#6-크래시-원인과-해결) (크래시 1~4)
7. [Fallback 구조](#7-fallback-구조)
8. [Android Studio 테스트 절차](#8-android-studio-테스트-절차)
9. [AAB 생성 전 체크리스트](#9-aab-생성-전-체크리스트)

---

## 1. 패키지 선택 과정

### 처음 시도: `capacitor-health-connect` (실패)

```bash
npm install capacitor-health-connect
# ERROR: peerDependency 충돌
```

**실패 이유:**

| 항목 | 값 |
|------|----|
| 프로젝트 Capacitor 버전 | `@capacitor/core@^8.3.4` |
| 패키지 요구 버전 | `@capacitor/core@^5.0.0` |
| 최신 버전 | `0.7.0` (Capacitor 8 미지원, 업데이트 중단) |

`--legacy-peer-deps`로 강제 설치해도 네이티브 플러그인 빌드 단계에서 Capacitor API 호환성 문제가 발생할 가능성이 높아 포기.

### 채택: `@capgo/capacitor-health-connect` → `@capgo/capacitor-health`

```bash
npm install @capgo/capacitor-health
```

**선택 이유:**

| 항목 | 값 |
|------|----|
| peerDependency | `@capacitor/core >= 8.0.0` |
| 설치 버전 | `8.5.1` |
| 지원 플랫폼 | Android (Health Connect), iOS (HealthKit) |
| 주요 API | `isAvailable`, `requestAuthorization`, `readSamples`, `queryAggregated` |

---

## 2. minSdkVersion 변경

### 변경 파일: `android/variables.gradle`

```gradle
# 변경 전
minSdkVersion = 24   # Android 7.0

# 변경 후
minSdkVersion = 26   # Android 8.0
```

**변경 이유:**

`@capgo/capacitor-health` 라이브러리의 `build.gradle`에서 `minSdkVersion = 26`을 선언하고 있어, 앱의 `minSdkVersion`이 더 낮으면 아래 빌드 에러가 발생:

```
uses-sdk:minSdkVersion 24 cannot be smaller than version 26
declared in library [:capgo-capacitor-health]
```

> **참고:** Health Connect 자체는 Android 9(API 28) 이상에서 앱으로 설치 가능하고, Android 14(API 34)부터 OS 내장. `minSdkVersion 26`은 앱 실행 최소 요건이며, HC 실제 사용은 런타임에 `isAvailable()`로 별도 체크.

---

## 3. Android 설정

### `android/app/src/main/AndroidManifest.xml`

플러그인의 라이브러리 매니페스트가 자동 머지되지만, 명시성을 위해 앱 매니페스트에도 직접 추가:

```xml
<!-- Health Connect 걸음수 읽기 권한 -->
<uses-permission android:name="android.permission.health.READ_STEPS" />

<!-- Health Connect 앱 설치 여부 확인 (API 30+ queries 블록 필요) -->
<queries>
    <package android:name="com.google.android.apps.healthdata" />
</queries>
```

**플러그인 라이브러리 매니페스트가 자동 추가하는 것들 (수동 추가 불필요):**

- `PermissionsRationaleActivity` — Android 13 이하에서 HC 권한 설명 화면
- `ViewPermissionUsageActivity` alias — Android 14+ 권한 사용 현황 뷰
- 모든 health 권한 (`READ_STEPS`, `READ_DISTANCE` 등)

---

## 4. 동작 흐름

### 전체 시퀀스

```
사용자: [운동 시작] 버튼 클릭
  └─ setState("running")
       ├─ [이펙트 A] HC 초기화 (initHealthConnect)
       │     ├─ Health.isAvailable() → 가용 여부 확인
       │     ├─ Health.requestAuthorization({ read: ["steps"] })
       │     │     └─ HC 권한 다이얼로그 표시 (앱 백그라운드)
       │     │     └─ 사용자 허용 후 앱 복귀
       │     ├─ readTodayStepsHC() → hcStartSteps 저장 (오늘 누적 기준점)
       │     └─ hcActive = true → 폴링 이펙트 활성화
       │
       └─ [이펙트 B] 타이머 걸음수 시뮬레이션
             └─ hcActive === true 이면 즉시 return (비활성)

운동 중 (5초 간격 폴링):
  └─ readTodayStepsHC() → currentTodaySteps
  └─ sessionSteps = max(0, currentTodaySteps - hcStartSteps)
  └─ setSteps(sessionSteps) → UI 실시간 반영

운동 종료 (저장):
  └─ readTodayStepsHC() → endSteps (최종값)
  └─ finalSteps = max(0, endSteps - hcStartSteps)
  └─ stride = height × 0.415 / 100 (m)   또는 기본 0.7m
  └─ finalDistance = finalSteps × stride / 1000 (km)
  └─ Supabase workout_history 저장
```

### 걸음수 표시 원칙

- **UI 표시**: 항상 `sessionSteps`(시작 이후 증가분)만 표시. 오늘 누적 총 걸음수는 화면에 노출하지 않음.
- **저장값**: 종료 시점 HC 최종 읽기값 기준. 폴링 중간값이 아닌 마지막 정확한 값 사용.

---

## 5. 코드 구조

### 파일별 역할

| 파일 | 역할 |
|------|------|
| `src/lib/healthConnectService.ts` | HC 초기화·권한·읽기 캡슐화. 내부 상태(`_state`) 관리 |
| `src/pages/Workout.tsx` | HC 이펙트 연결, polling, fallback 분기 |

### `healthConnectService.ts` 주요 함수

```ts
// HC 가용성 확인 + READ_STEPS 권한 요청
initHealthConnect(): Promise<"available" | "denied" | "unavailable">

// 오늘 자정 ~ 현재 누적 걸음수 합산 (readSamples 사용)
readTodayStepsHC(): Promise<number | null>

// 현재 HC 상태 조회
getHCState(): HCState

// 운동 재시작 시 내부 상태 초기화
resetHCState(): void
```

### `Workout.tsx` 주요 상태

```ts
const hcStartStepsRef = useRef<number | null>(null); // 운동 시작 시 기준 걸음수
const [hcActive, setHcActive] = useState(false);     // 폴링 이펙트 트리거용 state
const hcActiveRef = useRef(false);                   // 콜백 내 동기 접근용 ref
```

### 거리 계산 공식

```ts
// 키 정보 있으면 신체 기반 보폭, 없으면 기본 0.7m
const stride = userProfile?.height
  ? (userProfile.height * 0.415) / 100  // 키(cm) × 0.415 / 100 = 보폭(m)
  : 0.7;

const distance = parseFloat((steps * stride / 1000).toFixed(2)); // km
```

> HC 활성/비활성 모두 동일한 stride 공식 적용. 기존 하드코딩 `0.0008`(0.8m 고정)에서 변경.

---

## 6. 크래시 원인과 해결

### 크래시 1: `queryAggregated` 불안정

**증상:** HC 권한 허용 후 앱 복귀 시 즉시 종료.

**원인:**

```
queryAggregated → 내부적으로 시간 버킷마다 while-loop 반복 실행
  └─ 각 버킷마다 HealthConnectClient.aggregate() 호출
  └─ HC가 준비되지 않은 상태에서 호출하면 exception
  └─ SecurityException 등은 개별 catch로 처리되지만
     특정 상황에서 unchecked exception이 WebView까지 전파
```

**해결:** `queryAggregated` → `readSamples` 교체

```ts
// 변경 전 (불안정)
const { samples } = await Health.queryAggregated({
  dataType: "steps",
  startDate, endDate,
  bucket: "day",
  aggregation: "sum",
});
return samples[0]?.value ?? 0;

// 변경 후 (안정)
const { samples } = await Health.readSamples({
  dataType: "steps",
  startDate, endDate,
  limit: 1000,
  ascending: true,
});
return samples.reduce((sum, s) => sum + (Number(s?.value) || 0), 0);
```

`readSamples`는 단순히 레코드 목록을 반환하고 JS 단에서 합산하므로 네이티브 집계 루프 없이 안정적.

---

### 크래시 2: Unhandled Promise Rejection

**증상:** 운동 중 간헐적 앱 종료.

**원인:**

```ts
// 변경 전 — async 함수를 await 없이 호출
pollHC(); // Promise rejection이 unhandled로 남음
setInterval(pollHC, 5_000); // 동일 문제
```

WebView(Android)는 unhandled rejection을 치명적 오류로 처리해 앱을 종료할 수 있음.

**해결:** 모든 `pollHC()` 호출에 `.catch()` 추가

```ts
// 변경 후
pollHC().catch(() => {
  hcActiveRef.current = false;
  setHcActive(false); // 오류 시 타이머 방식으로 자동 전환
});

const id = setInterval(() => {
  pollHC().catch(() => {
    hcActiveRef.current = false;
    setHcActive(false);
  });
}, 5_000);
```

---

### 크래시 3: HC 초기화 중 예외 미처리

**원인:**

```ts
// 변경 전 — IIFE에 try/catch 없음
(async () => {
  const hcState = await initHealthConnect(); // 여기서 throw → 앱 종료
  ...
})();
```

**해결:** IIFE 전체 try/catch + 오류 시 명시적 fallback 처리

```ts
(async () => {
  try {
    const hcState = await initHealthConnect();
    if (hcState !== "available") return; // 거부/불가 → 타이머 유지
    ...
    setHcActive(true);
  } catch (e) {
    console.warn("[Workout] HC 초기화 실패, fallback:", e);
    hcStartStepsRef.current = null;
    hcActiveRef.current = false;
    setHcActive(false); // 타이머 방식으로 계속 진행
  }
})();
```

---

### 크래시 4: `NoClassDefFoundError: SpillingKt` (Kotlin 버전 충돌)

**증상:** HC 권한 허용 후 앱 복귀 시 즉시 종료. 크래시 1~3 수정 후에도 동일하게 발생.

**Logcat:**

```
java.lang.NoClassDefFoundError: Failed resolution of: Lkotlin/coroutines/jvm/internal/SpillingKt;
  at app.capgo.plugin.health.HealthPlugin.handlePermissionResult
  at app.capgo.plugin.health.HealthPlugin$requestAuthorization$1.invokeSuspend
```

**원인 분석:**

```
@capgo/capacitor-health@8.5.1
  └─ Kotlin 1.9.25 컴파일러로 빌드됨
  └─ 코루틴 state machine 바이트코드가 SpillingKt 클래스 참조 생성
       (Kotlin 1.9.x 코루틴 컴파일러의 내부 구현 클래스)

androidx.activity:1.11.0
  └─ 런타임에 kotlin-stdlib:2.0.21 당겨옴
  └─ Kotlin 2.0.x(K2 컴파일러) stdlib에는 SpillingKt 없음 → 크래시
```

**처음 시도한 해결책 (실패):**

```gradle
// android/app/build.gradle — configurations.all 에 force 추가
configurations.all {
    resolutionStrategy {
        force "org.jetbrains.kotlin:kotlin-stdlib:1.9.25"
        ...
    }
}
```

실패 이유: `configurations.all`은 해당 모듈(`:app`)의 설정에만 적용됨.  
플러그인은 `implementation project(':capgo-capacitor-health')`으로 별도 서브프로젝트로 포함되어 있어,  
플러그인 모듈 자체의 Gradle 의존성 해소는 앱 모듈의 `resolutionStrategy`로 제어되지 않음.

> `@capgo/capacitor-health`의 최신 버전(`8.5.1`)도 여전히 Kotlin 1.9.25를 사용하므로, npm 업데이트로는 해결 불가.

**실제 해결책: 플러그인을 Kotlin 2.0.21로 재컴파일**

```
node_modules/@capgo/capacitor-health/android/build.gradle 패치:
  kotlinVersion = '1.9.25' → '2.0.21'
  kotlin-gradle-plugin:1.9.25 → 2.0.21

결과:
  K2 컴파일러로 코루틴 state machine 재생성
  → SpillingKt 참조 없는 바이트코드 생성
  → 런타임 stdlib 2.0.21과 충돌 없음
```

패치 파일: `scripts/patch-capacitor-health.sh`

```bash
sed -i.bak \
  -e "s/def kotlinVersion = '1.9.25'/def kotlinVersion = '2.0.21'/" \
  -e "s/kotlin-gradle-plugin:1.9.25/kotlin-gradle-plugin:2.0.21/" \
  "node_modules/@capgo/capacitor-health/android/build.gradle"
```

`npm install` 시 `node_modules`가 덮어씌워지므로 `package.json`에 `postinstall` 훅으로 자동 재적용:

```json
"scripts": {
  "postinstall": "bash scripts/patch-capacitor-health.sh"
}
```

**변경된 파일 요약:**

| 파일 | 변경 내용 |
|------|-----------|
| `node_modules/@capgo/capacitor-health/android/build.gradle` | kotlinVersion `1.9.25` → `2.0.21` |
| `android/build.gradle` | kotlin-gradle-plugin `1.9.25` → `2.0.21` |
| `android/app/build.gradle` | resolutionStrategy force 블록 제거, kotlin-stdlib:1.9.25 명시 의존성 제거 |
| `scripts/patch-capacitor-health.sh` | 위 패치 자동화 스크립트 (신규) |
| `package.json` | `postinstall` 훅 추가 |

**Android Studio 적용 순서:**

```
1. File → Sync Project with Gradle Files   ← Kotlin 2.0.21 변경 적용
2. Build → Clean Project                   ← 이전 1.9.25 컴파일 캐시 삭제
3. Run ▶
```

---

## 7. Fallback 구조

HC를 사용할 수 없는 모든 경우에 기존 타이머 기반 방식이 자동으로 동작:

```
HC 비활성 조건                         결과
─────────────────────────────────────────────────────────
웹 브라우저 (비네이티브 환경)          즉시 unavailable
Health Connect 앱 미설치              unavailable
Android 9 미만 기기                   unavailable  
사용자가 권한 거부                     denied
initHealthConnect() 예외 발생          강제 unavailable
readTodayStepsHC() null 반환           해당 poll 건너뜀
pollHC() 예외 발생                     hcActive=false, 타이머 전환
─────────────────────────────────────────────────────────
위 조건 해당 시 → 기존 활동 유형별 타이머 걸음수 시뮬레이션 유지
```

### 타이머 방식 (HC 비활성 시)

```ts
// 활동 유형별 걸음 시뮬레이션
const intervalMap = {
  walker:       600ms,  // 분당 100보
  power_walker: 500ms,  // 분당 120보
  runner:       400ms,  // 분당 150보
  hiker:        667ms,  // 분당 90보
};
```

---

## 8. Android Studio 테스트 절차

### 빌드 및 동기화

```bash
npm run build          # 1. 웹 번들 빌드
npx cap sync android   # 2. Android 프로젝트에 웹 번들 복사
# 3. Android Studio에서 Run ▶ 버튼으로 에뮬레이터 실행
```

### HC 테스트 가능 환경

| 조건 | HC 동작 |
|------|---------|
| API 34+ 에뮬레이터 (Android 14) | OS 내장 HC, 즉시 사용 가능 |
| API 28~33 에뮬레이터 + HC 앱 설치 | HC 앱 별도 설치 후 사용 |
| API 27 이하 | HC 불가, 타이머 fallback |

### Logcat 필터링 (크래시 디버깅)

Android Studio Logcat에서 아래 태그로 필터:

```
tag:HealthConnect    # 플러그인 내부 로그
tag:Workout          # 앱 JS 경고 로그
tag:chromium         # WebView 자바스크립트 오류
tag:AndroidRuntime   # 네이티브 크래시 스택트레이스
```

앱에서 발생하는 경고는 `console.warn`으로 출력되므로 Logcat의 `chromium` 또는 `System.err` 태그에서 확인 가능:

```
[HealthConnect] initHealthConnect 오류: ...
[HealthConnect] readTodayStepsHC 오류: ...
[Workout] HC 초기화 실패, fallback: ...
[Workout] HC poll 오류, fallback: ...
```

### 에뮬레이터에 테스트 걸음수 추가

HC 에뮬레이터에서 걸음수 데이터를 수동 입력하려면:
1. Health Connect 앱 열기
2. Browse → Steps → Add data
3. 원하는 걸음수와 시간 입력

---

## 9. AAB 생성 전 체크리스트

구글 플레이 제출 전 반드시 확인:

### 필수 확인

- [ ] `android/variables.gradle` — `minSdkVersion = 26` 확인
- [ ] `AndroidManifest.xml` — `READ_STEPS` 권한 선언 확인
- [ ] `AndroidManifest.xml` — `<queries>` 블록 (HC 앱 패키지) 확인
- [ ] `npm run build && npx cap sync android` 최신 상태로 실행 완료

### 구글 플레이 정책 요구사항

Health Connect 권한을 사용하는 앱은 심사 시 아래를 요구:

- [ ] **개인정보처리방침 URL** — HC 관련 데이터 수집·사용 목적 명시 필요
- [ ] **Health Connect 권한 사용 이유** — 플레이 콘솔에서 각 권한 신청 사유 작성
- [ ] **Privacy Policy Activity** — 앱 내 개인정보처리방침 화면 존재 (플러그인이 `PermissionsRationaleActivity` 자동 제공)

> 현재 플러그인의 `PermissionsRationaleActivity`는 `www/privacypolicy.html` 파일을 자동으로 렌더링. 해당 파일을 앱 빌드 전에 준비해야 구글 플레이 심사 통과 가능.

### 빌드

```bash
# Android Studio → Build → Generate Signed Bundle/APK
# → Android App Bundle (AAB) 선택
# → 서명 키스토어 지정 후 Release 빌드
```
