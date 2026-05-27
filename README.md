# 💪 함께걸어요

걷기·러닝 습관을 게임처럼 즐기는 모바일 피트니스 커뮤니티 앱.
캐릭터를 선택하고, 걸음 수를 쌓고, 파티를 만들어 함께 목표를 달성해요.

## 기술 스택

| 분류          | 사용 기술                       |
| ------------- | ------------------------------- |
| 프레임워크    | React 18 + TypeScript           |
| 빌드          | Vite                            |
| 스타일        | Tailwind CSS v3                 |
| 라우팅        | React Router DOM v6             |
| 아이콘        | React Icons                     |
| 다국어        | react-i18next (한국어 / 영어)   |
| 백엔드        | Supabase (Auth · DB · Realtime) |
| 네이티브 앱   | Capacitor (Android)             |
| 푸시 알림     | Firebase FCM                    |

## 실행 방법

**웹 개발 서버**
```bash
npm run dev
```

**Android 에뮬레이터 테스트** (Android Studio 필요)
```bash
npm run build && npx cap sync android
# 이후 Android Studio에서 Run (▶) 실행
```

---

## 화면 구성

### 🚀 인트로 · 로그인

- 앱 브랜드 소개 슬라이드 (인트로)
- 이메일 회원가입 / 로그인 (Supabase Auth)
- 소셜 로그인 준비 중

### 🧭 온보딩

- 신체 정보 입력 (성별·나이·키·몸무게)
- 활동 유형 선택 (산책러 / 파워워커 / 러너 / 등산가)
- 아바타 캐릭터 선택

### 🏠 홈

- 연속 운동 스트릭 뱃지
- 캐릭터 이미지 + 실시간 말풍선 메시지
- 걸음 수 / 이번 주 운동 / 칼로리 스탯 카드
- 홈 상단 공지사항 배너 (Admin 입력 → 자동 표시)
- 이벤트 배너 연동
- 운동 시작 버튼 → 트래킹 화면 이동

### 🏃 운동 트래킹 (Step)

- 원형 링 게이지 + 캐릭터 애니메이션
- 실시간 걸음 수 / 거리 / 시간 / 칼로리
- 운동 말풍선 선택 (파티 멤버에게 실시간 노출)
- 30일 연속 챌린지 말풍선 보상
- 운동 종료 후 기록 저장 (Supabase)

### 🧙 캐릭터 (MyPage)

| 캐릭터      | 운동 스타일                    | 특징                 |
| ----------- | ------------------------------ | -------------------- |
| 🚶 산책러   | 걸음수 중심으로 가볍게 걷기    | 연속 운동 포인트 2배 |
| 🚶‍♂️ 파워워커 | 거리와 운동효과 중심 빠른 걷기 | 목표 달성 포인트 2배 |
| 🏃 러너     | 거리와 페이스 중심 러닝 기록   | 거리 달성 보너스     |
| 🏔️ 등산가   | 시간과 거리 중심 장거리 활동   | 파티 참여 보너스     |

- 주간·월간 통계 (걸음 수 / 칼로리 / 운동 횟수)
- 이벤트 탭 (참가 중인 이벤트 현황)
- 프리미엄 말풍선 아이템 탭

### 📋 운동 상세 페이지 (`/workout/:id`)

마이페이지 > 운동기록 탭에서 기록 카드 클릭 시 이동하는 상세 화면입니다.

- 히어로 카드: 거리 크게 + GPS/추정 배지 + 페이스·시간·칼로리
- 상세 그리드: 걸음수, 페이스, 시작시각, 거리 출처, 운동 유형 등
- 캐릭터 이미지 + 응원 메시지 (걸음수·거리·목표 달성 기준)
- GPS 경로 지도 카드 (route_points 있을 때) / placeholder (없을 때)
- 뒤로가기 → 운동기록 탭으로 복귀

### 🎉 파티

- 전체 파티 탐색 / 내 파티 탭
- 파티 만들기 (이름·**목표 유형(걸음수/거리)**·시간대·태그 / 욕설 필터링)
  - 걸음수 목표: 5,000 / 10,000 / 15,000보 선택 (인당 × 멤버 수 = 총 목표)
  - 거리 목표: 3 / 5 / 10km 선택 (인당 × 멤버 수 = 총 목표)
- 파티 이름 실시간 검색
- 오늘의 인기 파티 / 실시간 운동 중 파티 하이라이트

#### 파티 상세 (PartyDetail)

- 파티원 활동 그리드 (접속 여부 · 말풍선 · 걸음수/거리 실시간 — goal_type 기준)
- 오늘 파티 현황 바 (총 걸음수 또는 총 거리 / 파티 평균 / MVP)
- 파티 목표 100% 달성 시 커뮤니티 인증 피드 자동 포스팅 + 팝업 알림
- 📢 파티 공지 (방장 작성·삭제 / 전원 실시간 반영)
- 💬 응원 메시지 티커 (Supabase Realtime)
- 7일 비활동 멤버 강퇴 (방장 전용)
- 파티 해체 (방장 전용)
- 공지·응원 메시지 욕설 필터링

### 🥗 식단

- 활동 유형별 하루 운동 소모 목표 칼로리 (200~500 kcal)
- 게이지 바로 오늘 소모 칼로리 시각화
- 개인 BMR 기반 하루 권장 칼로리 실시간 계산
- 아침·점심·저녁 3끼 맞춤 식단 추천 (칼로리 스케일링)
- 프리미엄 대체 식단 새로고침 (구독 유도)

### 💬 커뮤니티 (인증 피드)

- 자유 게시글 작성 / 조회
- 게시글 욕설 필터링
- 카테고리별 탭 필터
- 포스트 카드 우측 하단 타임스탬프 (오늘이면 시각, 이전이면 월.일)
- **파티 목표 달성 자동 인증 배너** — 파티가 오늘 목표를 달성하면 인증 피드에 자동 게시
  - 파티장 계정으로 저장, 배너 스타일(🏆 파티 자동 인증)로 일반 포스트와 구분
  - `source_type='party_goal'` / `source_id=partyId` / `source_date=오늘` DB 저장
  - unique index로 같은 파티·같은 날 중복 방지 (23505 조용히 스킵)
  - localStorage 빠른 사전차단 + active_sessions 갱신 시 실시간 달성 감지

### ⚙️ 설정

- 테마 선택: 에너지 / 자연 / 코스모
- 알림 설정 (시트에서 세부 조정)
  - 운동 알림: 시작 리마인더 / 스트릭 유지 알림
  - 파티 알림: 파티 시작 전 알림 / 파티 공지
- 언어 전환: 한국어 / 영어
- 닉네임 변경 (30일 쿨타임 / 중복 체크 / 욕설 필터)
- 이메일 표시 / 개인정보처리방침 / 이용약관 / 문의

### 🛡️ 관리자 (Admin)

- 대시보드: 가입자 수 / 오늘 운동 인원 / 프리미엄 구독자 / **시간대별 운동 시작 차트**
- 공지사항 작성 → 홈 배너 자동 표시
- 이벤트 관리 (생성·수정·삭제·ON/OFF 토글)
- 이벤트 달성자 확인 → 보상 수동 지급 (기간제 이벤트)
- 프리미엄 말풍선 아이템 관리

---

## 테마 시스템

| 테마     | primary   | 분위기          |
| -------- | --------- | --------------- |
| energy   | `#ff5733` | 주황·빨강       |
| nature   | `#2ecc71` | 그린·옐로우     |
| cosmo    | `#5b6cf9` | 블루·퍼플       |
| midnight | `#0f172a` | 슬레이트·스카이 |

---

## Supabase 주요 테이블

| 테이블            | 용도                           |
| ----------------- | ------------------------------ |
| `app_users`       | 유저 프로필 (신체 정보·캐릭터) |
| `public_profiles` | 공개 프로필 뷰                 |
| `parties`         | 파티 정보                      |
| `party_members`   | 파티 멤버                      |
| `party_cheers`    | 응원 메시지                    |
| `party_notices`   | 파티 공지                      |
| `workout_history` | 운동 기록                      |
| `active_sessions`   | 실시간 운동 세션               |
| `user_goals`        | 유저 목표                      |
| `community_posts`   | 인증 피드 포스트 (`source_type·source_id·source_date` — 자동 포스트 중복 방지 unique index) |
| `fcm_tokens`      | Android FCM 디바이스 토큰      |
| `events`          | 이벤트 정의                    |
| `event_grants`    | 이벤트 보상 지급 내역          |

---

## 📱 Android 네이티브 운동 트래커 (Foreground Service)

운동 시작 시 잠금화면·알림창에 실시간 운동 현황을 표시하는 Android 네이티브 기능입니다.  
Capacitor 커스텀 플러그인으로 웹 ↔ 네이티브를 연결합니다.

### 관련 파일

| 파일 | 역할 |
|------|------|
| `src/lib/workoutNative.ts` | Capacitor 플러그인 TS 인터페이스 |
| `android/.../WorkoutPlugin.java` | 웹 ↔ 네이티브 브릿지 + 권한 관리 |
| `android/.../WorkoutService.java` | Foreground Service — 만보기 센서 · 알림 · 브로드캐스트 |
| `src/hooks/useYesterdayPace.ts` | 어제 기록 페이서 — 어제 이 시점 걸음수와 실시간 비교 |

### 알림 표시 내용

```
🚶 산책 중  ·  닉네임           ← 캐릭터 이미지 원형 아이콘
👣 342보   ⏱ 05:23             ← 컴팩트 뷰

── 펼치면 ──────────────────────
👣  걸음수  342보
⏱  운동시간  05:23
📍  0.27km   🔥  18kcal
[⏸ 일시정지]                    ← 알림에서 바로 제어
```

- `VISIBILITY_PUBLIC` — 잠금화면에서도 전체 내용 노출
- `BigTextStyle` — 펼치면 걸음수·시간·거리·칼로리 상세 표시
- 일시정지/재개 버튼 알림에서 직접 제어 가능

### 걸음수 단일화 구조 (Source of Truth)

| 단계 | 데이터 출처 |
|------|------------|
| 운동 중 알림 걸음수 | `WorkoutService` — `TYPE_STEP_COUNTER` 센서 직접 |
| 앱 화면 걸음수 | `WorkoutPlugin.notifyListeners("workoutUpdate")` → React state |
| 저장 걸음수 | 종료 직전 `getStatus()` 호출 → 서비스 최종 센서값 |

**세 값이 항상 동일한 센서값을 사용합니다.**

### 걸음수 측정 우선순위

```
1순위: TYPE_STEP_COUNTER 내장 센서 (ACTIVITY_RECOGNITION 권한 허용 시)
       → 실제 하드웨어 만보기, WorkoutService에서 직접 읽음
2순위: 활동 유형별 시뮬레이션 (권한 거절 또는 웹 브라우저)
       → 산책 100보/분, 파워워킹 120보/분, 러닝 150보/분, 등산 90보/분 기준 추정
       → 권한 거절 시 앱 내 안내 후 예상값으로 계속 진행 가능
```

### GPS 거리 추적 (Phase 1)

러너·등산가 유형에서 FusedLocationProviderClient 기반 실제 이동 거리 및 평균 페이스를 측정합니다.

| 항목 | 상세 |
|------|------|
| GPS 엔진 | `FusedLocationProviderClient` (Google Play Services) |
| 우선순위 | 러너·등산가 → `PRIORITY_HIGH_ACCURACY` / 산책·파워워킹 → `PRIORITY_BALANCED_POWER_ACCURACY` |
| 위치 갱신 주기 | 5초 / 최소 3초 / 최소 이동 거리 5m |
| 정확도 필터 | GPS 오차 반경 > 30m 이면 해당 위치 무시 |
| 점프 필터 | 5초 윈도우 내 > 60m 이동 시 노이즈로 간주 무시 |
| 거리 단조증가 | GPS 거리는 `Math.max(이전, 현재)` — 역주행 없음 |
| 일시정지 처리 | 정지 시 GPS 중단, 재개 시 `lastGpsLocation = null` 후 재측정 |
| steps 단일 출처 | GPS는 거리·페이스 전용 — 걸음수 센서(`TYPE_STEP_COUNTER`)는 영향 없음 |

**effectiveDistance (실효 거리) 선택 로직**

```
gpsDistance > 0 ? gpsDistance (GPS 실측)
              : steps × 보폭 / 1000 (추정)
```

**DB 마이그레이션**

```sql
-- supabase/gps_columns.sql
ALTER TABLE workout_history ADD COLUMN IF NOT EXISTS gps_distance numeric;
ALTER TABLE workout_history ADD COLUMN IF NOT EXISTS distance_source text DEFAULT 'estimated';
ALTER TABLE workout_history ADD COLUMN IF NOT EXISTS avg_pace numeric;

-- supabase/route_points.sql
ALTER TABLE workout_history ADD COLUMN IF NOT EXISTS route_points jsonb;
```

마이그레이션 미실행 시 프론트에서 해당 컬럼 자동 strip 후 저장 (앱 크래시 없음).

### GPS 경로(Route Points) 수집 — Phase 2

운동 중 이동 경로를 `{lat, lng, timestamp}` 배열로 수집해 DB에 저장하고, 운동 완료 후 지도로 시각화합니다.

| 항목 | 상세 |
|------|------|
| 수집 방식 | `WorkoutService`의 locationCallback — 정확도·점프 필터 통과 좌표만 누적 |
| 저장 포맷 | `[{ lat, lng, timestamp }]` JSON 배열 |
| 일시정지 처리 | pause 중 수집 중단 (재개 후 자동 복귀) |
| 전달 방식 | STOP 시 JSON 직렬화 → `static lastRoutePointsJson` 보관 → `getRoutePoints()` 플러그인 메서드로 JS에 전달 |
| 지도 렌더링 | Leaflet + OpenStreetMap, lazy load, max 300점 downsample |
| 결과 팝업 | 경로 있을 때 180px 미리보기 지도 (출발·도착 마커) |
| 운동 상세 | 280px 전체 지도 카드, 경로 없으면 placeholder 유지 |

---

### 트래커 UI — 활동 유형별 레이아웃

운동 중 메인 스탯 카드와 완료 결과 팝업이 활동 유형에 따라 다르게 표시됩니다.

| 유형 | 메인 카드 | 보조 3칸 |
|------|-----------|----------|
| 🚶 산책러 | 걸음수 (크게) | 칼로리 · 거리 · 시간 |
| 🚶‍♂️ 파워워커 | 거리 + 걸음수 (2열) | 페이스 · 시간 · 칼로리 |
| 🏃 러너 | 거리 + 걸음수 (2열) | 페이스 · 시간 · 칼로리 |
| 🏔️ 등산가 | 거리 + 걸음수 (2열) | 시간 · 페이스 · 칼로리 |

거리형 유형(파워워커·러너·등산가)은 거리와 걸음수를 나란히 표시하며, GPS/추정 배지도 함께 노출됩니다.

**완료 결과 팝업도 동일 로직으로 분기:**
- 거리형: 히어로 카드에 거리+걸음수 2열, 보조에 페이스·시간·칼로리
- 산책러: 히어로 카드에 걸음수 단독, 보조에 거리·시간·칼로리

### 권한 요청 흐름

**활동 인식 권한 (걸음수)**

- 앱 시작 시 자동 팝업 없음 — 운동 시작 버튼 클릭 시에만 확인
- 권한 없으면 자체 안내 모달 → Android 시스템 팝업 순서로 요청
- 거절 시: 추정 모드 진행 가능 (안내 포함)

**위치 권한 (GPS 거리)**

- 활동 인식 권한 확인 후, GPS 권한 상태를 조용히(popupless) 조회
- 미허용이면 자체 안내 모달 표시:
  > "실제 이동 거리와 평균 페이스를 기록하려면 위치 권한이 필요해요. 위치 정보는 운동 중 거리 계산에만 사용됩니다."
- "GPS 기록 허용하기" → Android 시스템 팝업 → 운동 시작
- "위치 권한 없이 시작하기" → 추정 거리 모드로 바로 시작 (Android 팝업 없음)

### 삼성 배터리 최적화 대응

- 운동 최초 시작 시 배터리 최적화 제외 여부 확인
- 미제외 상태이면 안내 모달 표시 (1회)
- "배터리 제한 해제하기" → Android 시스템 설정으로 바로 이동

### 백그라운드 복구

- `visibilitychange` 이벤트로 포그라운드 복귀 감지
- `WorkoutNative.getStatus()` 호출 → 서비스 상태 복구
- 서비스가 살아있으면 steps/elapsed 그대로 UI에 반영
- 서비스가 종료됐으면 idle 상태로 초기화

---

## 비즈니스 모델

- **무료**: 기본 운동 트래킹 · 파티 · 식단 추천 · 커뮤니티
- **프리미엄**: 말풍선 아이템 · 대체 식단 새로고침 · 고급 분석 리포트 (예정)

---

---

## 🎪 이벤트 시스템 (Event System)

관리자가 이벤트를 생성하면 유저가 조건을 달성해 보상(말풍선·칭호)을 획득하는 풀스택 이벤트 플랫폼입니다.  
기간제 이벤트와 고정(무기한) 이벤트 두 가지 방식을 지원합니다.

---

### 📦 파일 구조

| 파일 | 역할 |
|------|------|
| `src/data/events.ts` | `AppEvent` 타입 정의 · `CATEGORY_META` 상수 |
| `src/lib/eventService.ts` | Supabase CRUD · 달성자 집계 · 보상 지급 |
| `src/context/EventsContext.tsx` | 이벤트 목록 전역 상태 (Supabase 연동) |
| `src/hooks/useEvents.ts` | `byCategory` · `activeEvents` · 상태 라벨 계산 |
| `src/hooks/useEventGrants.ts` | 유저 보상 수령 목록 조회 (`event_grants`) |
| `src/pages/Step.tsx` | 유저향 — STEP 보상탭 · 이벤트탭 렌더링 |
| `src/pages/Admin.tsx` | 관리자향 — 이벤트 CRUD · 달성자 확인 · 보상 지급 |
| `supabase/events_system.sql` | `events` · `event_grants` 테이블 DDL + RLS |
| `supabase/add_is_fixed.sql` | `is_fixed` 컬럼 추가 + self-grant 정책 마이그레이션 |

---

### 🗄️ DB 구조

#### `events` 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | PK |
| `title` | text | 이벤트 제목 |
| `description` | text | 상세 설명 |
| `start_date` | date | 시작일 (고정 이벤트는 생성일로 자동 설정) |
| `end_date` | date | 종료일 (고정 이벤트는 `9999-12-31`) |
| `category` | text | `personal` · `party` · `streak` |
| `condition_type` | text | `period_goal` · `avg_steps` · `total_steps` · `consecutive_days` |
| `condition_value` | integer | 조건 기준값 |
| `reward_type` | text | `bubble` · `title` |
| `bubble_id` | text? | 보상 말풍선 ID |
| `title_text` | text? | 보상 칭호 텍스트 |
| `is_active` | boolean | 이벤트 ON/OFF |
| `is_fixed` | boolean | 고정 이벤트 여부 (기간 제한 없음) |

#### `event_grants` 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | PK |
| `event_id` | uuid | FK → events |
| `user_id` | uuid | FK → app_users |
| `reward_type` | text | 지급된 보상 타입 |
| `bubble_id` | text? | 지급된 말풍선 ID |
| `title_text` | text? | 지급된 칭호 텍스트 |
| `granted_by` | uuid | 지급자 (관리자 ID · 자기 자신) |

---

### 🗂️ 이벤트 카테고리 3종

| 카테고리 | 사용 가능한 조건 타입 | 달성자 집계 방식 |
|----------|--------------------|----------------|
| `personal` (개인) | `period_goal` · `avg_steps` | `workout_history` 기간 필터 → 유저별 합산 |
| `party` (파티) | `total_steps` · `avg_steps` | 파티원 전원 걸음수 합산 → 목표 초과 파티 선별 |
| `streak` (연속) | `consecutive_days` | `public_profiles.streak` 컬럼 직접 조회 |

#### 조건 타입 상세

| 조건 타입 | 사용 카테고리 | 계산식 |
|-----------|--------------|--------|
| `period_goal` | personal | 기간 내 유저 총 걸음수 합계 |
| `avg_steps` | personal | 유저 총 걸음수 ÷ 운동한 날 수 |
| `avg_steps` | party | 파티원 합산 걸음수 ÷ **이벤트 기간 일수** |
| `total_steps` | party | 파티원 합산 걸음수 합계 |
| `consecutive_days` | streak | `public_profiles.streak` 값 직접 비교 |

> **파티 `avg_steps` 예시**: 5월(31일) 이벤트에서 파티 합산 310만보 → 하루 평균 **10만보**로 집계

---

### ⚡ 이벤트 타입 2종

#### 기간제 이벤트 (time-limited)

```
관리자가 시작일/종료일 설정 → 유저가 기간 내 조건 달성
→ 이벤트 종료 후 관리자가 Admin 페이지에서 달성자 목록 확인
→ 개별 지급 또는 "전체 지급" 버튼으로 일괄 보상 지급
→ event_grants INSERT (granted_by = 관리자 ID)
→ 유저 Step 보상탭에 보상 아이템 자동 해금
```

- 유저 화면: "달성 완료! 보상 지급 대기 중 🎉" 배지 + 관리자 지급 안내 메시지
- 관리자 화면: 이벤트 만료 후 "달성자 확인" 버튼 → 바텀 시트에 달성자 목록 + 지급 버튼

#### 고정 이벤트 (fixed / permanent)

```
관리자가 is_fixed = true 로 생성 → 기간 제한 없이 상시 운영
→ 유저가 조건 달성 시 클라이언트에서 즉시 self-grant 실행
→ event_grants INSERT (granted_by = 유저 자신)
→ 보상 아이템 즉시 해금 — 관리자 개입 불필요
```

- 유저 화면: "해금됨! 🎉" 에메랄드 배지 + "아래 목록에서 보상을 선택하세요" 안내
- RLS: `user_id = auth.uid() AND is_fixed = true` 조건부 INSERT 허용 정책 적용

---

### 🔑 RLS 정책

| 테이블 | 정책 | 허용 대상 |
|--------|------|-----------|
| `events` | SELECT | 모든 유저 |
| `events` | INSERT · UPDATE · DELETE | 관리자 (`is_admin = true`) |
| `event_grants` | SELECT | 본인 레코드만 |
| `event_grants` | INSERT (관리자 지급) | 관리자 |
| `event_grants` | INSERT (self-grant) | 본인 + 고정 이벤트 조건 |
| `workout_history` | SELECT | 관리자 (달성자 집계용) |

---

### 🔗 프론트엔드 연동 흐름

#### 유저가 보상을 받는 과정

```
1. useEventGrants(user.id)
   └─ fetchUserEventGrants() → event_grants 쿼리
   └─ { grantedBubbleIds, grantedTitles } 반환

2. useUnlockItems(workoutRecords, grantedBubbleIds)
   └─ grantedBubbleIds에 포함된 아이템 → unlocked: true 강제 설정
   └─ Step 보상탭 아이템 목록에 즉시 반영

3. grantedTitles
   └─ Step 보상탭 "이벤트 보상 칭호" 섹션에 별도 렌더링
   └─ 일반 칭호와 동일하게 선택·적용 가능
```

#### 고정 이벤트 자동 지급 (Step.tsx)

```typescript
// 마운트/streak 변경 시 달성 여부 확인 후 중복 없이 self-grant
const autoGrantedRef = useRef<Set<string>>(new Set());
useEffect(() => {
  byCategory.streak.forEach((event) => {
    if (!event.isFixed) return;
    if (consecutiveStreak < event.conditionValue) return;
    if (autoGrantedRef.current.has(event.id)) return;
    autoGrantedRef.current.add(event.id);
    autoGrantFixedEvent(event.id, user.id, event.reward);
  });
}, [byCategory.streak, consecutiveStreak, user]);
```

---

### 🛠️ Supabase 초기 설정

이벤트 시스템을 처음 세팅할 때 SQL Editor에서 순서대로 실행합니다.

```bash
# 1. 테이블·RLS 생성
supabase/events_system.sql

# 2. 고정 이벤트 컬럼·self-grant 정책 추가
supabase/add_is_fixed.sql
```

---

### 🎯 관리자 운영 가이드

#### 이벤트 만들기

1. Admin → 이벤트 탭 → **+ 이벤트 추가** 버튼
2. 제목·설명 입력
3. 카테고리 선택: 개인 / 파티 / 연속
4. 조건 선택: 총 걸음수 / 일평균 걸음수 / 연속 일수
5. 보상 선택: 말풍선 ID 또는 칭호 텍스트 입력
6. **고정 이벤트** 토글 ON → 기간 입력 생략, 상시 운영
7. 저장 후 ON/OFF 토글로 즉시 활성화 제어

#### 기간제 이벤트 보상 지급

1. 이벤트 종료 후 해당 이벤트 카드의 **달성자 확인** 버튼 클릭
2. 달성자 목록 바텀 시트에서 개별 **지급** 또는 상단 **전체 지급** 실행
3. 이미 지급된 유저는 "지급됨" 표시로 중복 방지
4. 파티 이벤트는 파티명 기준으로 그룹화하여 표시

---

## 🔔 알림 시스템 (Notification System)

인앱 알림함 · 웹 푸시 · 스케줄 알림 세 가지 레이어로 구성된 풀스택 알림 시스템입니다.

---

### 📦 파일 구조

| 파일 | 역할 |
|------|------|
| `src/lib/notificationService.ts` | Supabase CRUD · 푸시 구독 저장/삭제 |
| `src/hooks/useNotifications.ts` | 알림 목록 조회 + Realtime 구독 |
| `src/hooks/usePushSubscription.ts` | Service Worker 등록 · 브라우저 푸시 구독/해제 |
| `src/utils/notificationTriggers.ts` | 이벤트별 알림 생성 헬퍼 함수 모음 |
| `src/components/notifications/FloatingNotificationButton.tsx` | 우측 상단 플로팅 종 버튼 + unread 뱃지 |
| `src/components/notifications/NotificationDrawer.tsx` | 알림 목록 Drawer UI |
| `public/sw.js` | Service Worker — 푸시 수신 → OS 알림 표시 |
| `supabase/functions/notify-scheduled/index.ts` | Edge Function — 스케줄 알림 생성 |
| `supabase/functions/notify-push/index.ts` | Edge Function — 웹 푸시 실제 발송 |
| `supabase/notifications_schema.sql` | DB 테이블 · RLS · Realtime 설정 SQL |
| `supabase/cron_schedule.sql` | pg_cron 스케줄 등록 SQL |

---

### 1. 인앱 알림함

앱 우측 상단 플로팅 종 버튼 → Drawer로 알림 목록 확인.  
Supabase Realtime 구독으로 새 알림이 오면 뱃지가 즉시 갱신됩니다.

**Supabase 테이블**

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | PK |
| `user_id` | uuid | 수신자 |
| `type` | text | `party_joined` · `party_started` · `goal_reached` · `streak_warning` · `diet_reminder` · `system` |
| `title` | text | 알림 제목 |
| `body` | text | 알림 본문 |
| `data` | jsonb | 추가 메타데이터 (party_id 등) |
| `is_read` | boolean | 읽음 여부 |
| `created_at` | timestamptz | 생성 시각 |

---

### 2. 이벤트 기반 알림

앱 내 특정 행동 발생 시 자동으로 DB에 알림을 생성합니다.

| 이벤트 | 수신자 | 수정 위치 |
|--------|--------|-----------|
| 파티 참가 | 파티 리더 | `src/hooks/useParty.ts` → `handleJoin` |
| 운동 목표 달성 | 본인 | `src/pages/Workout.tsx` → `performSave` |

**새 이벤트 알림 추가하는 법**

```typescript
// 1. src/utils/notificationTriggers.ts 에 함수 추가
export async function notifyXxx(params: { userId: string; ... }) {
  await createNotification({
    user_id: params.userId,
    type: "system",
    title: "제목",
    body: "본문",
    data: {},
    is_read: false,
  });
}

// 2. 원하는 곳에서 호출 (fire-and-forget)
notifyXxx({ userId: user.id, ... }).catch(() => {});
```

---

### 3. 스케줄 알림 (pg_cron)

매일 정해진 시각에 Edge Function이 조건에 맞는 유저들에게 자동 발송합니다.

| 스케줄명 | 시각 (KST) | 대상 조건 | 내용 |
|----------|-----------|-----------|------|
| `activity-reminder` | 오후 12시 | 최근 7일 활성 & 오늘 미운동 | "오늘 운동 어때요?" |
| `diet-lunch-reminder` | 오후 1시 | 최근 7일 활성 유저 전체 | "점심 후 10분 걷기" |
| `diet-dinner-reminder` | 오후 6시 | 오늘 운동 완료한 유저 | 소모 칼로리 포함 저녁 식단 안내 |
| `streak-warning` | 오후 8시 | 최근 3일 활성 & 오늘 미운동 | 연속 스트릭 일수 포함 경고 |

**조건·내용 수정**  
`supabase/functions/notify-scheduled/index.ts` 의 해당 `case` 블록 수정 후 재배포:
```bash
supabase functions deploy notify-scheduled --project-ref <PROJECT_REF>
```

**스케줄 시간 변경**  
`supabase/cron_schedule.sql` 의 cron 식 수정 후 Supabase SQL Editor에서 재실행.  
cron 식 형식: `'분 시(UTC) 일 월 요일'` — KST는 UTC+9이므로 시각에서 9 차감.

---

### 4. FCM 푸시 알림 (Android 네이티브)

앱이 완전히 종료되거나 잠금화면 상태에서도 카카오톡처럼 알림을 수신합니다.

**동작 흐름**

```
앱 설치 → 로그인 → FCM 토큰 자동 발급 → fcm_tokens 테이블 저장

파티 시작 / 파티원 합류 이벤트 발생
  → notify-party-start / notify-party-joined Edge Function
  → notify-fcm Edge Function 호출 (await)
  → Google FCM HTTP v1 API로 발송
  → 기기 잠금화면·알림창에 즉시 표시
```

**관련 파일**

| 파일 | 역할 |
|------|------|
| `src/lib/fcmService.ts` | FCM 토큰 등록 · 권한 요청 · 이벤트 리스너 |
| `supabase/functions/notify-fcm/index.ts` | Firebase Admin JWT 생성 → FCM HTTP v1 발송 |
| `supabase/fcm_tokens.sql` | fcm_tokens 테이블 DDL + RLS |
| `android/app/google-services.json` | Firebase Android 설정 |

**Supabase Secrets 필요 항목**

| 변수명 | 설명 |
|--------|------|
| `FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase 서비스 계정 키 JSON (전체) |

---

### 5. 웹 푸시 알림

브라우저/기기가 닫혀 있어도 OS 레벨 알림을 수신할 수 있습니다.

**플랫폼별 지원**

| 환경 | 지원 여부 |
|------|----------|
| PC 브라우저 (Chrome·Edge·Firefox) | ✅ |
| 안드로이드 Chrome | ✅ |
| iOS Safari 16.4+ (홈 화면 추가 후) | ✅ |
| iOS Safari 일반 탭 | ❌ |

**동작 흐름**

```
유저가 설정 > 알림 > 기기 푸시 토글 켜기
  → Service Worker 등록 (public/sw.js)
  → 브라우저 권한 요청
  → PushSubscription 생성 (VAPID 공개키 사용)
  → push_subscriptions 테이블에 저장

스케줄/이벤트 발생
  → notify-scheduled: notifications 테이블 INSERT
  → notify-push Edge Function 호출
  → push_subscriptions 조회 → web-push 라이브러리로 발송
  → 만료된 구독(410/404) 자동 삭제
```

**환경 변수**

| 위치 | 변수명 | 설명 |
|------|--------|------|
| `.env` | `VITE_VAPID_PUBLIC_KEY` | VAPID 공개키 (클라이언트) |
| Edge Function Secrets | `VAPID_PUBLIC_KEY` | VAPID 공개키 (서버) |
| Edge Function Secrets | `VAPID_PRIVATE_KEY` | VAPID 비공개키 (서버) |
| Edge Function Secrets | `VAPID_CONTACT_EMAIL` | 연락처 이메일 |
| Edge Function Secrets | `CRON_SECRET` | pg_cron → Edge Function 인증 토큰 |

VAPID 키 생성: `npx web-push generate-vapid-keys`

---

### 5. 수동 테스트 (curl)

```bash
curl -X POST https://<PROJECT_REF>.supabase.co/functions/v1/notify-scheduled \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <SUPABASE_ANON_KEY>" \
  -H "x-cron-secret: <CRON_SECRET>" \
  -d '{"type":"streak_warning"}'
# {"sent": N} 응답 오면 성공
```

type 값: `streak_warning` · `activity_reminder` · `diet_lunch` · `diet_dinner`

---

## 🥑 식단 관리 탭 (Diet Management)

사용자의 실제 신체 정보와 당일 운동 소모 칼로리를 기반으로, 맞춤형 하루 3끼 식단을 가이드하고 프리미엄 구독 모델(Freemium)을 유기적으로 연결한 핵심 기능 페이지입니다.

### 🎯 1. 서비스 방향성 (Product Direction)

- **일회성 측정 탈피**: 단순히 걸음 수만 기록하는 만보기 앱을 넘어, "내가 오늘 움직인 만큼 무엇을 얼마나 먹어야 하는가?"에 대한 직관적인 해답을 제공하여 앱의 **리텐션(재방문율)**을 극대화합니다.
- **자연스러운 구독 유도(Freemium)**: 대다수의 유저가 원하는 기본 다이어트 기능을 무료로 개방하되, 고도화된 개인화 옵션을 프리미엄 영역으로 제한하여 유저 경험을 해치지 않는 영리한 비즈니스 모델을 구축했습니다.

---

### 💡 2. 주요 기능 (Key Features)

#### 🔄 이 메뉴 싫어요! 대체 식단 무제한 셔플 (Premium)

- 무료 유저는 고정된 추천 식단 리스트만 볼 수 있지만, 프리미엄 유저는 자신의 입맛에 맞는 메뉴가 나올 때까지 제한 없이 대체 식단을 새로고침할 수 있습니다.
- 브라우저의 `localStorage`를 활용하여 새로고침을 하더라도 유저가 최종 선택한 식단 데이터가 안전하게 유지되도록 최적화했습니다.

#### 🔵 세 갈래 목표 선택 세그먼트 버튼 (Premium)

- 유저의 건강 목적에 따라 **[체중 감량 🔵 | 체중 유지 🟢 | 근육 증량 🟠]** 상태를 실시간으로 전환할 수 있습니다.
- **구독 제어**: 가장 수요가 높은 '체중 감량'을 기본 무료 제공하여 앱의 락인(Lock-in) 효과를 만들고, '체중 유지/근육 증량' 선택 시 프리미엄 구독 팝업을 띄워 유료 전환을 유도합니다.

#### 📊 맞춤형 운동·식단 칼로리 가이드 모달

- 유저가 어려운 헬스케어 용어(TDEE 등)로 인해 인지 부조화를 겪지 않도록, 화면에 노출된 정보(BMR, 활동 타이틀)를 기반으로 직관적인 텍스트 안내 가이드를 제공합니다.

---

### 🧮 3. 칼로리 계산 및 수식 로직 (Calculation Logic)

하단 3끼 추천 식단은 마이페이지에 입력된 신체 정보를 기반으로 산출된 **기초대사량(BMR)**과 유저가 선택한 **활동 유형별 목표 칼로리**를 종합하여 기본 계산량을 산출하며, 유저의 '목표 선택'에 따라 한 끼니당 칼로리가 실시간으로 스케일링됩니다.

> 💡 **수학적 설계 가이드 (앱 베이스가 '체중 감량' 모드 기준일 때)**

1. **체중 감량 (Free 기본 제공)**
   - 하루 총 **−300 kcal**가 이미 반영된 다이어트 특화 칼로리 세팅
   - `아침/점심/저녁 각 끼니 칼로리 변동 없음 (기존 데이터 유지)`

2. **체중 유지 (Premium 해금)**
   - 숨만 쉬어도 쓰는 돈(BMR) + 오늘 활동으로 쓴 돈을 쓴 만큼 고스란히 섭취하는 상태
   - 체중 감량 상태 대비 하루 총 **+300 kcal** 추가 섭취 필요
   - `끼니당 계산식: 각 추천 식단 칼로리에 실시간 +100 kcal 가중치 부여`

3. **근육 증량 (Premium 해금)**
   - 벌크업 및 근성장을 위해 더 많은 에너지를 보충하는 상태
   - 체중 감량 상태 대비 하루 총 **+600 kcal** 추가 섭취 필요 (유지 기준보다 +300kcal 더)
   - `끼니당 계산식: 각 추천 식단 칼로리에 실시간 +200 kcal 가중치 부여`

---

### 🛠️ 4. 기술 스택 및 구현 디테일

- **State Management**: React `useState`, `useEffect`를 통한 프리미엄 유저 권한 체크 및 실시간 칼로리 가중치 렌더링.
- **Data Persistence**: `localStorage` 연동을 통한 유저 셔플 식단 상태 보존.
- **Tailwind CSS**: 유저 등급 및 활성화 상태에 따른 동적 UI 스타일링 (Amber 및 Primary 테마 가시성 확보).
