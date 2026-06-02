# Changelog

## [1.0.23] — 2026-06-02

### 긴급 크래시 수정 (hotfix)

#### 앱 시작 즉시 강제 종료 — Galaxy A20 등 전 기기
- **원인:** `@capgo/capacitor-health` 플러그인(Kotlin 1.9.25)이 `androidx.activity:1.11.0`이 요구하는 Kotlin 2.0.21과 버전 충돌 → `NoClassDefFoundError: SpillingKt` → 앱 시작 즉시 크래시
- **경위:** v1.0.15(5월 22일) Health Connect 실험적 연동 당시 추가된 패키지가 이후 HC 기능을 제거한 뒤에도 잔류
- **수정:** `@capgo/capacitor-health` 패키지 완전 제거, `healthConnectService.ts` 및 `patch-capacitor-health.sh` 삭제

#### 운동 시작 불가 — Android 14+ 기기
- **원인:** `WorkoutService.startForeground(id, notification)` 호출 시 서비스 타입 미지정 → Android 14+(API 34) + targetSdk 36 환경에서 예외 → 서비스 즉시 중단 → 운동 시작 안 됨
- **수정:** `Build.VERSION_CODES.UPSIDE_DOWN_CAKE` 이상에서 `FOREGROUND_SERVICE_TYPE_LOCATION` 명시

#### AndroidManifest 정리
- `foregroundServiceType="health|location"` → `"location"` (`health` 타입은 API 34+ 전용)
- `FOREGROUND_SERVICE_HEALTH` 권한 제거
- `android.permission.health.READ_STEPS` 권한 제거

---

## [Unreleased] — 2026-06-02

### 업적 배지 이미지화 + 홈화면 배지 장착 시스템

#### 배지 이미지 개별 파일 전환
- 스프라이트 시트 방식 → **개별 WebP 파일** (`badge_01.webp ~ badge_25.webp`) 방식으로 전환
- `scripts/split-badges.mjs` — badges.png 스프라이트 시트를 25개 개별 PNG로 자르는 Node.js 스크립트
- Sharp로 PNG → WebP 변환 (약 **82% 용량 절감**, 평균 2.1MB → 380KB)
- Sharp `trim()` 으로 각 배지의 투명 여백 자동 제거 후 1024×1024 재조정
- `BadgeSprite` 컴포넌트: 스프라이트 CSS 계산 코드 제거, `<img>` 단순화

#### 홈화면 배지 장착 시스템 (냉장고 자석 방식)
- `src/hooks/useEquippedBadges.ts` — 장착 배지 상태 관리 (localStorage 저장, 최대 8개)
- 홈화면 캐릭터 영역 우측 하단 **✏️ 편집 버튼** → 편집 모드 진입
- 편집 모드: 획득한 배지 목록에서 선택 → 캐릭터 영역 원하는 위치 탭 → 해당 좌표에 배지 부착
- 부착된 배지 탭 → 제거 / **완료** 버튼으로 편집 종료
- 배지는 캐릭터·말풍선 뒤(z-0)에 렌더링, 캐릭터는 앞(z-10)
- 배지가 컨테이너 경계를 벗어나지 않도록 반지름 기반 좌표 clamp 처리

#### 배지 페이지 정리
- 이모지 기반 `Achievements.tsx` 제거
- `AchievementsImage.tsx` → `/achievements` 라우트로 통합 (이미지 버전으로 단일화)

---

## [Unreleased] — 2026-06-01

### 업적 배지 시스템 신규 추가

#### 신규 파일
- `src/data/achievements.ts` — 업적 정의 24개 (카테고리 8종 · 난이도 4단계)
- `src/lib/achievementStatsService.ts` — 통계 계산 순수함수 + Supabase 쿼리 분리
- `src/hooks/useAchievements.ts` — 오케스트레이터 훅 (로컬 + 원격 통계 조합)
- `src/pages/Achievements.tsx` — 2열 배지 그리드 + 카테고리 탭 + 상세 바텀시트

#### 마이페이지 연동
- 내정보 탭 버튼 2개 → 3개 (활동유형 / 캐릭터 / **업적달성**)
- 업적달성 버튼에 달성 수 실시간 표시 (예: `3/24`)

#### 배지 UI 디자인
- 난이도별 원형 그라데이션 배경 (쉬움=초록 / 보통=파랑 / 어려움=주황 / 레전드=보라)
- 달성 → 골드 링 + 우측 하단 ✓ 마크, 미달성 → 그레이스케일 + 자물쇠 오버레이
- `hidden: true` 업적: 달성 전까지 `???`로 표시

#### 업적 조건 연결 현황

| 조건 | 데이터 출처 |
|------|------------|
| 운동 기록 전체 (걸음수·스트릭·시간대 등) | `workoutRecords` 로컬 계산 |
| 계절별 운동 (`season_workout`) | `workoutRecords.date` 월 추출, DB 불필요 |
| 해금 말풍선 수 (`unlock_count`) | `unlockItems` 조건 로컬 재계산 |
| 파티 MVP 횟수 (`party_mvp`) | `app_users.party_mvp_count` 컬럼 |
| 파티 참가·목표 달성 횟수 | `party_members` / `community_posts` Supabase |
| 인증글 수·받은 응원 수 | `community_posts` Supabase |
| 날씨별 운동 (`weather_workout`) | `workout_history.weather_condition` 컬럼 |
| 프리미엄 가입 | `userProfile.is_premium` |

#### DB 마이그레이션 필요 (Supabase SQL Editor에서 순서대로 실행)
```
supabase/workout_weather.sql     — workout_history.weather_condition 컬럼
supabase/party_mvp_count.sql     — app_users.party_mvp_count 컬럼 + RPC 함수
```

#### 기타 수정
- 운동 저장 시 세션스토리지 날씨 캐시 읽어 `weather_condition` 함께 저장
- 파티 목표 달성 시 MVP 유저 `party_mvp_count` 자동 증가 (RPC 경유, fire-and-forget)
- 날씨 위젯: Nominatim 역지오코딩으로 한국어 지역명 표시 + 긴 이름 말줄임
- 프리미엄 말풍선 애니메이션: 흰 배경에서도 보이도록 골드 글로우로 변경
- Step 페이지 칭호 조건 아래 진행도 게이지 추가

---

## [1.0.21] — 2026-06-01

### 운동 기록 중복 저장 버그 수정 + 자정 날짜 변경 자동 저장

#### 버그 수정: 운동 기록 중복 저장 (`Workout.tsx`)

목표 달성 시 자동 완료 경로에서 `WorkoutNative.stopWorkout()`이 호출되지 않아 Android Foreground Service가 계속 실행 상태로 남는 문제를 수정.

**재현 경로:**
1. 목표 달성 → `performSave()` 완료, `isSaved.current = true`
2. 화면 이탈 → 컴포넌트 언마운트 → `isSaved.current` 초기화
3. 화면 재진입 → `restoreFromNative()`가 실행 중 서비스를 감지 → `setState("running")`
4. `goalProgress >= 100` effect 재발동 → `performSave()` 재호출 → **중복 저장**

**수정 내용:**
- 목표 달성 effect에 `WorkoutNative.stopWorkout()` 추가 — 서비스를 즉시 종료해 재마운트 시 running 복원을 차단

#### 신규 기능: 자정 날짜 변경 자동 저장

며칠간 운동 트래커를 종료하지 않을 경우 모든 걸음수가 종료한 날짜 하나에 합산되던 문제를 해결.

**수정 내용:**
- `WK_KEY.startDate` (`wk_start_date`) 추가 — 운동 시작 날짜를 localStorage에 영속 저장
- `formatDateIso()` 모듈 레벨 헬퍼 추출
- `performSave()`에 `overrideDate` 파라미터 추가 — 자동 저장 시 실제 운동 날짜로 기록
- 1초 타이머에 자정 감지 로직 추가:
  - 현재 날짜 ≠ `wk_start_date` 이면 서비스 최종 걸음수 수집 → `stopWorkout()` → `performSave(date: 시작날짜)` → `setState("done")`
  - 앱 강제종료 후 다음 날 재실행 시에도 localStorage에서 시작 날짜를 복원해 동작

---

## [1.0.20] — 2026-05-29

### 알림 문구 전면 개선 — 캐릭터 1인칭 대화체

- **파티 시작**: `"{파티명}" 파티가 시작됐어요! / {닉네임}님이 출발했어요! 우리도 얼른 가볼까요?`
- **오후 12시**: `☀️ 오늘의 첫 걸음, 저랑 같이 시작해요!` — 10분 동기부여 문구
- **오후 1시**: `🥗 밥 먹고 저랑 10분만 걸어요!` — 캐릭터가 직접 제안하는 톤
- **오후 8시 스트릭**: `딱 10분만 움직이면 {N}일 스트릭 지킬 수 있어요. 저 준비됐어요! 같이 나가요!`
- **오후 8시 스트릭 없음**: `🚶 저랑 오늘 첫 기록 만들어볼까요?`
- **목표 달성**: `🎯 목표 달성! 정말 대단해요! / 오늘 {N} 다 채웠어요 💪 내일도 함께해요!`
- `PartyDetail.tsx` 시작 알림 미리보기 모달 문구 실제 발송 문구와 일치

---

## [1.0.19] — 2026-05-29

### FCM 푸시 알림 파이프라인 전체 수정 (잠금화면 푸시 정상화)

Firebase Console 테스트는 성공하지만 앱 기능으로 보낸 알림이 잠금화면/알림바에 표시되지 않던 문제를 다단계 디버깅으로 완전 해결.

**원인 1 — `notify-fcm` CORS 핸들러 누락**
- `notify-party-joined`, `notify-party-start`에는 OPTIONS 핸들러가 있었으나 `notify-fcm`에만 없었음
- Capacitor WebView가 OPTIONS Preflight → 400 수신 → 실제 POST 차단
- 수정: `notify-fcm/index.ts`에 `corsHeaders` + OPTIONS 즉시 반환 추가

**원인 2 — `verify_jwt = false` 미적용 (`config.toml` 무시)**
- `notify-fcm/config.toml`에 `verify_jwt = false`를 기록했으나 Supabase CLI가 배포 시 파일을 무시
- `notify-party-start → notify-fcm` 서버-서버 호출이 `401 UNAUTHORIZED_INVALID_JWT_FORMAT`으로 차단
- 수정: 모든 알림 Edge Function을 `--no-verify-jwt` 플래그로 재배포

**원인 3 — FCM payload priority 오류**
- `android.priority: "high"` (소문자) → FCM HTTP v1 API는 `"HIGH"` (대문자) 사용, 소문자는 NORMAL로 처리되어 도즈 모드에서 지연·무시
- `android.notification.notification_priority` 누락 → 시스템 헤즈업/잠금화면 표시 안 됨
- 수정: `priority: "HIGH"`, `notification_priority: "PRIORITY_HIGH"` 적용

**디버깅 과정에서 추가한 로깅**
- `notify-fcm`: OAuth2 토큰 발급 성공/실패, fcm_tokens 조회 건수, FCM payload 전체, 전송 결과 status/body
- `notify-party-start`: 진입 로그, 파티원 수, notify-fcm fetch URL·응답 status/body

**배포 대상 함수 (모두 `--no-verify-jwt`)**
- `notify-fcm`, `notify-scheduled`, `notify-push`, `notify-party-joined`, `notify-party-start`

---

## [1.0.18] — 2026-05-28

### 산책러 GPS 지도 + 알림 UI 수정 + 스플래시 텍스트

- `Workout.tsx`: 산책러(walker) 보조 거리 카드에 GPS 배지(`📍 GPS` / `📍 추정`) 추가 — 운동 중 GPS 활성 여부 실시간 표시
- `activityTypes.ts`: 산책러 style 문구 "걸음수 중심으로 가볍게 걷기" → "걸음수 + GPS 거리 · 가볍게 걷기" — 활동 유형 선택 카드에서 GPS 거리 지원 명시
- `notification_workout_compact.xml`: 컴팩트 알림 루트 패딩 `4dp → 0dp` — Android 12+ 시스템 content 영역 내에서 거리·칼로리 줄 및 상태 텍스트가 잘리던 문제 수정
- `splash_layout.xml`: 스플래시 화면 아이콘 하단에 "함께걸어요" 텍스트(22sp · bold · 흰색) 추가

---

## [1.0.16] — 2026-05-28

### FCM 푸시 알림 연결 + 파티 달성 기준 수정

- `notificationService.ts`: `createNotification()` 이후 `notify-fcm` Edge Function 호출 추가 — 목표 달성·스트릭 경고·식단 리마인더 알림이 인앱 저장에만 머물던 것을 실제 FCM 푸시로 발송되도록 수정
- `notify-push/index.ts`: `x-cron-secret` 전용이던 인증을 JWT `Authorization` 헤더도 허용하도록 수정 — 클라이언트에서 직접 호출 가능
- `partyService.ts`: `getAchievedPartiesForUser` 파티 달성 배너 목표 계산을 `max_members`(최대 정원) → `members.length`(실제 가입 인원) 기준으로 수정
- `CLAUDE.md`: Supabase 테이블 스키마 최신화 (`is_premium`, `premium_expires_at`, `source_type`, `source_id`, `source_date`, `frame_id`, `goal_type`, `target_distance`, `event_grants`, `events`, `fcm_tokens` 반영)
- `MainActivity.java`: FCM 푸시 알림 채널 `"default"` 등록 (IMPORTANCE_HIGH) — 기존 `"workout_channel"`만 있어 FCM 메시지가 묻히던 문제 수정

### DB 정책 변경 (Supabase Dashboard)

- `community_posts` INSERT RLS에 `"파티 달성 자동 인증글"` 정책 추가 (`WITH CHECK (source_type = 'party_goal')`) — 파티원 누구나 PartyDetail 진입 시 목표 달성 자동 인증글을 올릴 수 있도록 허용, 기존 "본인만 작성" 정책은 일반 글에 그대로 유지

---

## [1.0.15] — 2026-05-27

### Android Foreground Service 배터리 최적화

- `WorkoutService.java`: 캐릭터 비트맵 캐시 적용 — 매 초 재디코딩 → 최초 1회만 디코딩 후 재사용 (`cachedCharBitmap` / `cachedCharId`)
- `WorkoutService.java`: `onSensorChanged`에서 `updateNotification()` 제거 — 걸음 감지 시마다 알림 갱신하던 이중 업데이트를 1초 타이머로 통합
- `WorkoutService.java`: GPS 위치 콜백을 `HandlerThread("GpsCallbackThread")`로 분리 — 기존 `Looper.getMainLooper()` 사용에 의한 메인 스레드 부하 방지

---

## [1.0.14] — 2026-05-27

### 파티 목표 유형 · UX 개선 · 버그 수정

**파티 목표 유형 추가 (걸음수 / 거리)**

- `party_goal_type.sql`: `parties` 테이블에 `goal_type` (text, default 'steps'), `target_distance` (numeric) 컬럼 추가
- `partyService.ts`: `Party`, `CreatePartyInput` 타입에 `goal_type`, `target_distance` 필드 추가, `createParty`에 신규 컬럼 저장
- `Party.tsx`: 파티 만들기 모달에 "목표 유형" 토글 탭 추가 (👣 목표 걸음수 / 📍 목표 거리), 거리 옵션 3/5/10km, 총 목표 안내 문구 분기
- `Party.tsx` 파티 카드: 목표 아이콘·레이블·값 `goal_type` 기준 분기, 오늘 현황 게이지 거리/걸음수 분기

**PartyDetail 거리 목표 전면 반영**

- `partyService.ts`: `PartyMember`에 `today_distance` 추가, `getPartyMembers`에서 오늘 GPS/추정 거리 합산
- `partyService.ts`: `PartyTodayStats`에 `totalDistance` 추가, `getPartyTodayStats`에서 거리 집계
- `PartyDetail.tsx`: 상단 정보 칩 `goal_type` 분기 (👟 N보 / 📍 Nkm), 오늘 파티 현황 게이지 거리 기준 분기, MVP 수치 km/보 분기
- `MemberActivityCard`: `goalType` prop 추가 — 캐릭터 아래 수치 거리 목표 시 `today_distance(km)` 표시

**버그 수정**

- `WorkoutService.java`: `getStaticRoutePointsJson()` — 서비스 살아있으면 live `routePoints` 직접 직렬화 반환 → `stopWorkout()` fire-and-forget 후 `getRoutePoints()` 호출 시 race condition으로 `null` 저장되던 문제 해결
- `partyService.ts`: `getPartyById` `.single()` → `.maybeSingle()` 변경 + `PartyDetail`에 1초 재시도 로직 추가 → 파티 입장 시 간헐적 406 오류 및 "파티를 찾을 수 없어요" 화면 해결

**UI 문구 개선**

- `RunnerStatsTab.tsx`: 활동분석 탭 "러닝" → "활동" 문구 전면 교체
- `RunnerStatsTab.tsx`: 최근 활동 카드 이모지를 `workout_type` 기준 유형별 이모지로 변경 (🚶/🚶‍♂️/🏃/🏔️)
- `activityTypes.ts`: 활동 유형 `style` 설명 문구 개선 (분당 kcal 제거 → 운동 중심 서술)
  - 산책러: "걸음수 중심으로 가볍게 걷기"
  - 파워워커: "거리와 운동효과 중심 빠른 걷기"
  - 러너: "거리와 페이스 중심 러닝 기록"
  - 등산가: "시간과 거리 중심 장거리 활동"
- `InfoTab.tsx` · `ActivityTypePage.tsx`: "분당 Xkcal 소모" 라인 제거
- `Workout.tsx`: 목표 뱃지 클릭 시 `/mypage?tab=info`(목표 설정 섹션)로 이동

---

## [1.0.13] — 2026-05-27

### GPS 경로 지도 + 트래커 UI 개선

**GPS 경로(route_points) 수집 및 저장**

- `WorkoutService.java`: 정확도·점프 필터 통과 좌표를 `{lat, lng, timestamp}`로 누적, pause 중 수집 중단, STOP 시 JSON 직렬화
- `WorkoutPlugin.java`: `getRoutePoints()` 메서드 추가 — 직렬화된 경로 JSON을 JS로 전달
- `workoutNative.ts`: `getRoutePoints()` 인터페이스 추가
- `workoutService.ts`: `WorkoutRecord`에 `route_points` 타입 추가, fallback 저장 시 자동 제외
- `Workout.tsx`: `performSave`에서 `getRoutePoints()` 호출 후 DB 저장에 포함
- `supabase/route_points.sql`: `workout_history.route_points jsonb` 컬럼 마이그레이션

**GPS 경로 지도 렌더링 (Leaflet + OpenStreetMap)**

- `RouteMap` 컴포넌트 신규 추가 (`src/components/ui/RouteMap.tsx`)
  - `small` prop: 결과 팝업용 180px / 상세 페이지용 280px
  - 300점 downsample — 장거리 운동도 빠르게 렌더링
  - 출발(초록) · 도착(테마색) 원형 마커
  - 지도 로드 실패 시 null 반환 (앱 크래시 없음)
  - lazy load + Suspense 적용
- 완료 결과 팝업: `route_points` 있을 때 180px 미리보기 지도 표시
- 운동 상세 페이지: `route_points` 있으면 280px 지도 카드, 없으면 기존 placeholder 유지

**운동 상세 페이지 (`/workout/:id`) 신규**

- 마이페이지 > 운동기록 탭 카드 클릭 시 이동
- 히어로 카드 (GPS/추정 배지 + 거리·페이스·시간·칼로리)
- 상세 그리드 (걸음수·페이스·운동 유형·거리 출처 등)
- 캐릭터 이미지 + 응원 메시지
- GPS 경로 지도 카드
- 뒤로가기 → 마이페이지 운동기록 탭
- 파일 위치: `src/components/mypage/WorkoutDetail.tsx`

**트래커 UI — 활동 유형별 레이아웃**

- 거리형(러너·파워워커·등산가) 메인 카드: 거리 + 걸음수 2열 나란히 (값·단위 `items-baseline`)
- 산책러 메인 카드: 걸음수 단독 (기존 유지)
- GPS/추정 배지 파워워커까지 확장
- 완료 결과 팝업도 유형별 분기:
  - 거리형: 히어로에 거리+걸음수 2열, 보조에 페이스·시간·칼로리
  - 산책러: 히어로에 걸음수 단독, 보조에 거리·시간·칼로리

**버그 수정**

- 활동분석 탭 최근러닝 카드 `flex-shrink-0` 추가 → flex 환경에서 잘림 현상 해결

---

## [1.0.12] — 2026-05-27

### GPS DB 저장 · 설정 버전 자동 연동

- `supabase/gps_columns.sql`: `workout_history`에 `gps_distance`, `distance_source`, `avg_pace` 컬럼 추가
- `workoutService.ts`: GPS 필드 저장 활성화, 컬럼 미존재 시 fallback 재시도 (코드 42703)
- `Workout.tsx`: `avg_pace` 계산 후 저장
- `vite.config.ts`: `__APP_VERSION__` 빌드 시 `package.json` 버전 주입
- `Settings.tsx`: 앱 정보 버전 표시를 `__APP_VERSION__`으로 자동 연동

---

## [1.0.11] — 2026-05-26

### GPS 거리 추적 + 권한 모달

**GPS 실측 거리 (FusedLocationProviderClient)**

- `WorkoutService.java`: Google Play Services `FusedLocationProviderClient` 기반 GPS 거리 측정 추가
  - 러너·등산가 → `PRIORITY_HIGH_ACCURACY` / 산책·파워워킹 → `PRIORITY_BALANCED_POWER_ACCURACY`
  - 정확도 필터: 오차 반경 > 30m 위치 무시
  - 점프 필터: 5초 내 > 60m 이동은 노이즈로 무시
  - GPS 거리 단조증가(monotonic) 보장 — 역주행 방지
  - 일시정지 시 GPS 중단, 재개 시 `lastGpsLocation = null` 후 재측정
  - 브로드캐스트에 `gps_distance_m`, `gps_active` 필드 추가
- `WorkoutPlugin.java`: `checkLocationPermission` / `requestLocationPermission` 메서드 추가 (Capacitor 브릿지)
- `android/AndroidManifest.xml`: `ACCESS_FINE_LOCATION`, `FOREGROUND_SERVICE_LOCATION` 권한 추가; 서비스에 `foregroundServiceType="health|location"` 추가 (Android 14+ 필수)
- `src/lib/workoutNative.ts`: `WorkoutPlugin` 인터페이스에 `checkLocationPermission`, `requestLocationPermission` 추가; `WorkoutUpdate`에 `gpsDistance`, `distanceSource` 필드 추가
- `src/lib/workoutService.ts`: `WorkoutRecord` 타입에 `gps_distance?`, `distance_source?` 추가; DB 저장 시 컬럼 미존재 기간 동안 해당 필드 strip
- `src/pages/Workout.tsx`:
  - `gpsDistance` / `distanceSource` 상태 추가; `workoutUpdate`에서 GPS 거리 단조증가 갱신
  - `effectiveDistance` = GPS > 0 ? GPS : 추정 — 페이스 계산·UI 표시에 반영
  - 운동 화면 거리 카드: 러너·등산가 운동 중 `📍 GPS` (에메랄드) / `📍 추정` (회색) 배지 표시
  - 완료 모달 거리 레이블: `거리 · GPS` / `거리 · 추정` 구분
  - 저장 시 `gps_distance`, `distance_source` 포함
- `src/components/mypage/RunnerStatsTab.tsx`:
  - `getDistance()`: `gps_distance > 0` 이면 GPS 값 우선 사용
  - 최근 러닝 목록: 레코드별 `GPS` / `추정` 배지 표시 (에메랄드 / 회색)
  - 안내 배너: "GPS 거리 추적 연동됨" (에메랄드 테두리)

**GPS 커스텀 권한 모달**

- 위치 권한 미허용 상태에서 운동 시작 시 Android 시스템 팝업 전에 자체 안내 모달 표시
- "GPS 기록 허용하기" → 시스템 권한 팝업 → 운동 시작
- "위치 권한 없이 시작하기" → 추정 거리 모드로 즉시 시작 (시스템 팝업 없음)
- 기존 `AlertModal` 컴포넌트 재사용 (IoLocationSharp 아이콘, 파란색 계열)

---

## [1.0.10] — 2026-05-26

### 미드나잇 테마 + 차트 그라디언트

- `midnight` 테마 추가: 슬레이트(`#0f172a`) · 스카이(`#38bdf8`) 계열
- `src/index.css`: `[data-theme="midnight"]` CSS 변수 정의
- 설정 화면 테마 선택 카드에 midnight 항목 추가
- `RunnerStatsTab.tsx` 거리 차트: primary → secondary 방향 그라디언트 바 적용
- `StatsTab.tsx` 주간 활동 차트: 동일 그라디언트 패턴 통일

---

## [1.0.9] — 2026-05-25

### 운동 트래킹 완전 재구조화

**핵심 변경: 단일 진실 공급원 (Single Source of Truth)**

| 항목 | 이전 | 현재 |
|------|------|------|
| 실시간 걸음수 | Health Connect 폴링 (지연·불일치) | `TYPE_STEP_COUNTER` 센서 직접 수신 |
| 알림 걸음수 | 센서 기반 | 동일 (센서) |
| UI 걸음수 | HC 기반 (불일치 발생) | 동일 (센서 브로드캐스트) |
| 저장 걸음수 | UI 캐시 | `getStatus()` 서비스 최종값 주입 |

Health Connect는 실시간 트래킹에서 완전히 제거. 알림·UI·저장 걸음수가 모두 동일한 값을 가리킴.

**Android Foreground Service 개선**

- `WorkoutPlugin.java`: `load()` override + `notifyListeners()` 패턴으로 리스너 재작성  
  (기존 `@PluginMethod RETURN_CALLBACK` 방식은 Capacitor 라우팅 버그로 이벤트 미전달)
- `WorkoutService.java`:
  - Samsung 냉시작(cold-start) 알림 탭 충돌 수정 — `FLAG_ACTIVITY_SINGLE_TOP | FLAG_ACTIVITY_CLEAR_TOP` 추가
  - `BigTextStyle` 확장 알림: 걸음수·시간·거리·칼로리 표시
  - 알림 액션 버튼: 일시정지 / 재개 (PendingIntent.getService)
  - `VISIBILITY_PUBLIC` — 잠금화면에서 내용 전체 노출
  - 캐릭터 이미지 원형 크롭 후 largeIcon 표시

**권한 흐름 개선**

- `ACTIVITY_RECOGNITION` 권한을 앱 시작 시 자동 요청하지 않음
- 운동 시작 버튼 클릭 시 커스텀 안내 모달 → 시스템 권한 다이얼로그 순서로 요청
- 권한 거부 시: 추정 모드(estimationMode) 진입, 경보 모달로 "정확도 낮을 수 있음" 안내
- 모달은 기존 `AlertModal` 컴포넌트 + React Icons 사용

**Samsung 배터리 최적화 안내**

- 첫 운동 시작 전 한 번만 배터리 최적화 제외 안내 모달 표시
- `localStorage("battery_guide_shown")` 으로 재노출 방지
- `Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` 시스템 화면으로 이동

**디버깅 지원**

- `handleStop` 시 `[FINAL_SNAPSHOT]` Logcat 로그 출력
  - 서비스 걸음수 vs UI 걸음수, 서비스 경과시간 vs UI 경과시간 비교
- `performSave(overrideSteps?, overrideElapsed?)` — 서비스 최종값 주입 가능

---

## [1.0.8] — 2026-05-24

### FCM 푸시 알림

- Firebase FCM 연동 (Supabase Edge Function `notify-fcm`)
- `push_subscriptions` 테이블에 FCM 토큰 저장
- 운동 완료 시 FCM 푸시 알림 발송
- Android POST_NOTIFICATIONS 권한 처리 (Android 13+)

---

## [1.0.7] — 2026-05-23

### Android 소셜 로그인 · 인트로

- Android 소셜 로그인 딥링크 수정
- 인트로 화면 슬라이드 정리
- 로딩 스크린 레이아웃 및 아이콘 애니메이션 개선

---

## [1.0.2] — 2026-05-22

### 극단적 날씨 건강 안내

- 폭염/한파 감지 시 건강 경고 메시지 표시
- 로딩 스크린 아이콘 앱 로고로 교체 (테마색 적용)

---

## [1.0.1] — 2026-05-21

### 운동 UX 개선

- 스트릭 1,000보 기준 통일
- 칼로리 걸음수 기반 계산으로 전환
- Health Connect 미사용 권한 제거

---

## [1.0.0] — 초기 출시

- 캐릭터 선택 및 온보딩
- 걸음수 카운터 (페도미터)
- 동네 파티 탐색 및 참가
- 목표 거리 + 포인트 시스템
- 운동 후 식단 추천 (BMR/TDEE 기반 칼로리 스케일링)
- Supabase Auth + DB 연동
- React i18n 한국어/영어 다국어
