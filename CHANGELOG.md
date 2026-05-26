# Changelog

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
