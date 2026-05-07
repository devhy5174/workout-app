# 💪 Workout App

운동 습관을 게임처럼 즐기는 모바일 피트니스 앱.
캐릭터를 선택하고, 걸음 수를 쌓고, 포인트를 모아 보상을 받아요.

---

## 기술 스택

| 분류 | 사용 기술 |
|------|-----------|
| 프레임워크 | React 18 + TypeScript |
| 빌드 | Vite |
| 스타일 | Tailwind CSS v3 |
| 라우팅 | React Router DOM v6 |
| 아이콘 | React Icons |
| 다국어 | react-i18next (한국어 / 영어) |
| 백엔드 | Supabase (예정) |

---

## 실행 방법

```bash
npm install
npm run dev
```

---

## 화면 구성

### 🏠 홈 (`/`)
- 연속 운동 스트릭 뱃지
- 캐릭터 이미지 + 말풍선 메시지
- 걸음 수 / 이번 주 운동 / 포인트 저금 스탯 카드
- 요일별 운동 달성 동그라미 (월~금)
- 오늘 목표까지 남은 걸음 수 배너

### 🧙 캐릭터 (`/character`)
- 6개 캐릭터 유형 중 선택
- 각 캐릭터별 운동 스타일 · 포인트 보너스 안내
- 선택 시 카드 강조 + 하단 확인 버튼 활성화

| 캐릭터 | 특징 | 보너스 |
|--------|------|--------|
| 🚶 워커 | 매일 꾸준한 산책 | 연속 운동 포인트 2배 |
| 🏃 스프린터 | 단거리 질주 | 목표 달성 포인트 2배 |
| 🧘 요가마스터 | 꾸준함과 균형 | 7일 연속 달성 보너스 |
| 🏋️ 파워리프터 | 집중 고강도 운동 | 주간 목표 달성 보너스 |
| 🌊 스위머 | 수영 전신 단련 | 포인트 1.5배 적립 |
| 🚵 어드벤처러 | 야외 등산 탐험 | 파티 참여 보너스 |

### 🎉 파티 (`/party`)
- 탭 2개: 동네 파티 / 내 파티
- 파티 카드: 멤버 수, 목표 거리, 운동 시간대, 파티장 닉네임
- 참가하기 버튼 (모집 마감 시 비활성)
- 🏆 랭킹 보기 → 이번 주 걸음 수 TOP 3 바텀 시트
- 파티 만들기 버튼

### 💰 포인트 (`/points`)
- 잔액 카드 (그라디언트)
- 탭 3개: 적립내역 / 선물하기 / 교환하기
  - **적립내역**: 날짜별 포인트 획득·차감 이력
  - **선물하기**: 친구 선택 → 포인트 금액 선택 → 선물
  - **교환하기**: 카페·제휴브랜드 기프티콘 (준비중 배지)

### 🥗 식단 (`/diet`)
- 오늘 칼로리 진행 바 (870 / 2,000 kcal)
- 아침 / 점심 / 저녁 식사 카드
- 저녁 미정 시 추천 메뉴 자동 표시 (삶은계란·고구마·그릭요거트)
- 운동 후 단백질 섭취 알림 배너
- 걸음 수 기반 추천 + 캐릭터 유형별 맞춤 식단

### 🎯 목표 (`/goal`)
- 목표 거리 달성 프로그레스 바
- 누적 포인트(저금) 현황

### ⚙️ 설정 (`/settings`)
- 테마 선택: 에너지 / 자연 / 코스모
- 알림·언어·계정·앱 정보 메뉴

---

## 테마 시스템

전역 `ThemeContext`로 관리. CSS 변수 기반이라 컴포넌트 수정 없이 전체 색상이 전환됩니다.

```css
/* Tailwind 토큰 → CSS 변수 매핑 */
primary        → --color-primary
secondary      → --color-secondary
accent         → --color-accent
bg             → --color-bg
primary-light  → --color-primary-light
```

| 테마 | primary | secondary | 분위기 |
|------|---------|-----------|--------|
| energy | `#ff5733` | `#ff8c42` | 주황·빨강, 에너지 |
| nature | `#2ecc71` | `#f1c40f` | 그린·옐로우, 자연 |
| cosmo  | `#5b6cf9` | `#a855f7` | 블루·퍼플, 우주 |

---

## 폴더 구조

```
src/
├── pages/
│   ├── Home.tsx
│   ├── Character.tsx
│   ├── Party.tsx
│   ├── Points.tsx
│   ├── Diet.tsx
│   ├── Goal.tsx
│   └── Settings.tsx
├── components/
│   └── layout/
│       ├── Header.tsx
│       └── BottomNav.tsx
├── context/
│   └── ThemeContext.tsx
├── data/                    # 더미 데이터 + 타입 정의
│   ├── characters.ts        # 캐릭터 6종 + 식단 프로파일
│   ├── diet.ts              # 추천 식품 / 추천 메뉴 세트
│   └── meals.ts             # 오늘 식단 기록 + 주간 히스토리
└── locales/
    ├── ko/
    └── en/
```

---

## 데이터 레이어

`src/data/`에 타입과 더미 데이터를 정의했습니다.  
추후 Supabase 연동 시 각 파일 하단의 주석 처리된 fetch 함수로 교체하면 됩니다.

```ts
// 현재 (더미)
import { todayMeals } from "@/data/meals";

// 교체 후 (Supabase)
const meals = await supabase
  .from("meal_records")
  .select("*")
  .eq("user_id", userId)
  .eq("date", today);
```

> ⚠️ `SUPABASE_SERVICE_KEY`는 절대 프론트엔드 코드에 포함하지 마세요.  
> `.env` 파일로 관리하고 `.gitignore`에 추가하세요.

---

## 환경 변수

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
