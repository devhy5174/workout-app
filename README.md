# 💪 함께걸어요

걷기·러닝 습관을 게임처럼 즐기는 모바일 피트니스 커뮤니티 앱.
캐릭터를 선택하고, 걸음 수를 쌓고, 파티를 만들어 함께 목표를 달성해요.

## 기술 스택

| 분류       | 사용 기술                       |
| ---------- | ------------------------------- |
| 프레임워크 | React 18 + TypeScript           |
| 빌드       | Vite                            |
| 스타일     | Tailwind CSS v3                 |
| 라우팅     | React Router DOM v6             |
| 아이콘     | React Icons                     |
| 다국어     | react-i18next (한국어 / 영어)   |
| 백엔드     | Supabase (Auth · DB · Realtime) |

## 실행 방법

```bash
npm run dev
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

| 캐릭터      | 칼로리     | 특징                 |
| ----------- | ---------- | -------------------- |
| 🚶 산책러   | 분당 3kcal | 연속 운동 포인트 2배 |
| 🚶‍♂️ 파워워커 | 분당 5kcal | 목표 달성 포인트 2배 |
| 🏃 러너     | 분당 8kcal | 거리 달성 보너스     |
| 🏔️ 등산가   | 분당 6kcal | 파티 참여 보너스     |

- 주간·월간 통계 (걸음 수 / 칼로리 / 운동 횟수)
- 이벤트 탭 (참가 중인 이벤트 현황)
- 프리미엄 말풍선 아이템 탭

### 🎉 파티

- 전체 파티 탐색 / 내 파티 탭
- 파티 만들기 (이름·목표 걸음 수·시간대·태그 / 욕설 필터링)
- 파티 이름 실시간 검색
- 오늘의 인기 파티 / 실시간 운동 중 파티 하이라이트

#### 파티 상세 (PartyDetail)

- 파티원 활동 그리드 (접속 여부 · 말풍선 · 걸음 수 실시간)
- 오늘 파티 현황 바 (총 걸음 수 / 파티 평균 걸음 수 / MVP)
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

### 💬 커뮤니티

- 자유 게시글 작성 / 조회
- 게시글 욕설 필터링
- 카테고리별 탭 필터

### ⚙️ 설정

- 테마 선택: 에너지 / 자연 / 코스모
- 알림 설정 (시트에서 세부 조정)
  - 운동 알림: 시작 리마인더 / 스트릭 유지 알림
  - 파티 알림: 파티 시작 전 알림 / 파티 공지
- 언어 전환: 한국어 / 영어
- 닉네임 변경 (30일 쿨타임 / 중복 체크 / 욕설 필터)
- 이메일 표시 / 개인정보처리방침 / 이용약관 / 문의

### 🛡️ 관리자 (Admin)

- 대시보드: 가입자 수 / 오늘 운동 인원 / 프리미엄 구독자
- 공지사항 작성 → 홈 배너 자동 표시
- 이벤트 관리 (생성·수정·삭제)
- 프리미엄 말풍선 아이템 관리

---

## 테마 시스템

| 테마   | primary   | 분위기      |
| ------ | --------- | ----------- |
| energy | `#ff5733` | 주황·빨강   |
| nature | `#2ecc71` | 그린·옐로우 |
| cosmo  | `#5b6cf9` | 블루·퍼플   |

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
| `active_sessions` | 실시간 운동 세션               |
| `user_goals`      | 유저 목표                      |
| `events`          | 이벤트                         |

---

## 비즈니스 모델

- **무료**: 기본 운동 트래킹 · 파티 · 식단 추천 · 커뮤니티
- **프리미엄**: 말풍선 아이템 · 대체 식단 새로고침 · 고급 분석 리포트 (예정)

---

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

### 4. 웹 푸시 알림

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
