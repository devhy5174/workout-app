# Changelog

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
