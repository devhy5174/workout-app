# Workout App 프로젝트

## 기술 스택

- React + TypeScript + Vite
- Tailwind CSS v3
- React Router DOM
- React Icons
- react-i18next (한국어/영어)

## 테마 시스템

- ThemeContext로 전역 관리
- energy(주황빨강) / nature(그린노랑) / cosmo(파랑보라)
- CSS 변수로 색상 관리 (--color-primary 등)

## 폴더 구조

src/
├── pages/ (Home, Character, Party, Goal, Diet, Settings)
├── components/layout/ (Header, BottomNav)
├── components/ui/ (공통 컴포넌트)
├── context/ (ThemeContext)
└── locales/ (ko, en 번역파일)

## 앱 기능

1. 캐릭터 선택
2. 걸음수 카운터 (페도미터)
3. 동네 파티 탐색
4. 목표거리 + 저금 (포인트)
5. 운동 후 식단 알림
6. 실시간 포인트 (Supabase Realtime 예정)

## 디자인

- 라이트모드
- 에너지 느낌 (주황/빨강 메인)
- 폰트: Nunito + Nanum Round Gothic (둥글둥글)
- 모바일 앱 느낌, 하단 탭바 네비게이션

## 주의사항

- .env에 Supabase 키 관리 (아직 미연결)
- SUPABASE_SERVICE_KEY는 절대 프론트에 넣지 말것

## 개발 규칙

- 모든 이미지에 alt 텍스트 필수
- 버튼에 aria-label 추가
- 색상 대비 충분히 (밝은 배경에 흰글씨 금지)
- 터치 영역 최소 44px 이상

## 코드 구조 규칙

- Supabase 통신은 항상 src/lib/[기능]Service.ts 에서
- 상태 관리는 항상 src/hooks/use[기능].ts 훅으로 분리
- 페이지 컴포넌트는 훅에서 데이터 받아서 UI만 담당
- 새 기능 추가시:
  1. [기능]Service.ts 에 Supabase 함수 작성
  2. use[기능].ts 훅에서 isLoading/error 상태 관리
  3. 페이지에서 훅 import해서 사용

## 폴더 구조 규칙

- src/lib/ → Supabase 서비스 파일
- src/hooks/ → 커스텀 훅
- src/pages/ → 페이지 컴포넌트 (UI만)
- src/components/ → 재사용 컴포넌트
- src/data/ → 고정 데이터 (Supabase 교체 불필요)
- src/utils/ → 유틸 함수

## Supabase 테이블 구조

### 테이블명 주의

- 유저 테이블은 반드시 `app_users` 사용 (users 아님!)
- 다른 유저 정보는 `public_profiles` 뷰에서 읽기

### RLS Policy 현황

app_users

- 본인 읽기 (SELECT) - 내 정보 조회
- 본인 수정 (UPDATE) - 내 정보 수정
- 본인 삽입 (INSERT) - 가입시 추가

parties

- 파티 전체 읽기 (SELECT) - 누구나 읽기 가능
- 파티 생성 (INSERT) - 로그인 유저만
- 방장만 수정 (UPDATE)
- 방장만 삭제 (DELETE)

party_members

- 멤버 전체 읽기 (SELECT) - 누구나 읽기 가능
- 본인 참가 (INSERT)
- 본인 탈퇴 (DELETE)

user_goals

- 본인 목표 (ALL)

workout_history

- 본인 운동기록 (ALL)

public_profiles (뷰)

- 제한없음 (UNRESTRICTED) - id, nickname, character_id, activity_type_id, points, streak만 노출

---

---

## [식단 페이지 기획 지침] 식단 페이지 운영법 및 코드 연동 가이드

본 문서는 '함께걸어요' 앱의 `Diet.tsx`, `diet.ts`, `activityTypes.ts` 간의 데이터 연동 구조를 바로잡고, 무료 유저 확보(Hooking) 및 프리미엄 구독(유료화) 비즈니스 모델을 성공시키기 위한 개발 지침서입니다.

---

## 1. 핵심 UI/UX 정체성 및 화면 분리 원칙

모든 유저는 가입 시 신체 정보(성별, 나이, 키, 몸무게)를 입력하므로, **원칙적으로 모든 유저에게 실시간 맞춤형 데이터**를 제공합니다. 단, 화면의 상단과 하단의 역할을 명확히 분리합니다.

### 1) 상단 카드: 오늘의 운동 목표 (트래커)

- **목적:** 유저에게 "오늘 더 걷고 달리게 만드는" 게임 같은 동기부여 제공.
- **로직:** 가입 시 선택한 활동 유형에 따라 **'하루 운동 소모 목표 칼로리(200~500kcal)'**를 부여하고, 오늘 걸어서 채운 칼로리(`burnedKcal`)만큼 게이지 바가 차오르게 만듭니다.
- **활동 유형별 고정 운동 목표 상숫값:**
  - `walker` (산책러): **200 kcal**
  - `power_walker` (파워워커): **300 kcal**
  - `runner` (러너): **400 kcal**
  - `hiker` (등산가): **500 kcal**

### 2) 하단 섹션: 오늘의 3끼 추천 (맞춤 식단)

- **목적:** 내 신체 스펙에 딱 맞는 건강한 권장 칼로리와 식단 가이드 제공.
- **로직:** 고정 데이터인 `diet.ts`를 그대로 보여주지 않고, 유저의 실시간 하루 권장 섭취량(`personalDailyKcalTarget`) 기준에 맞춰 **식단 칼로리 수치를 실시간 비례 계산(Scaling)**하여 보여줍니다.

---

## 2. 3끼 추천 식단 실시간 스케일링(Scale) 공식

`diet.ts`에 들어있는 식단 수치는 고정값(하드코딩)이므로, 화면에 뿌려줄 때 유저의 `personalDailyKcalTarget`에 맞춰 연산합니다.

1. **끼니별 권장 칼로리 표준 비중 정의:**
   - 아침: **30%** (`ratio: 0.3`)
   - 점심: **40%** (`ratio: 0.4`)
   - 저녁: **30%** (`ratio: 0.3`)

2. **실시간 배율(`scaleFactor`) 연산 로직:**
   - 유저의 맞춤 끼니 목표: $personalizedMealKcal = personalDailyKcalTarget \times ratio$
   - 고정 데이터 대비 배율: $scaleFactor = \frac{personalizedMealKcal}{diet.ts\text{ 고정 메뉴의 }totalNutrition.kcal}$

3. **UI 바인딩 규칙:**
   - 각 끼니 카드의 메인 타이틀 칼로리는 `personalizedMealKcal`을 출력합니다.
   - 하위 단품 음식들(`menu.foods`)의 칼로리 표기도 기본 고정값에 `scaleFactor`를 곱한 수치(`Math.round(food.nutrition.kcal * scaleFactor)`)로 실시간 보정하여 출력합니다.

---

## 3. [비즈니스 모델] 무료 vs 프리미엄 기능 분리 설계

유저가 초반에 이탈하지 않고 결제까지 자연스럽게 유도하기 위해 다음과 같이 기능을 제한하고 확장 가능하도록 UI 구조를 설계합니다.

### 🆓 무료 기본 제공 기능 (유저 감동 및 락인)

- 실시간 계산된 **개인 맞춤형 운동 목표 칼로리 및 게이지 바** 작동.
- 유저 신체 스펙에 맞게 칼로리 숫자가 실시간으로 리사이징된 **3끼 추천 식단 정보 노출**.
- 신체 정보(BMR/TDEE) 원리를 설명해 주는 정보(i) 가이드 모달 팝업 확인.

### 💎 프리미엄 구독 기능 (추후 결제 유도 기능)

- **대체 식단 새로고침:** "이 메뉴 싫어요!" 버튼 클릭 시 다른 맞춤 메뉴로 변경되는 기능 (현재 구조에서는 무료 유저에게 버튼 노출 후 클릭 시 구독 유도 팝업 창을 띄울 것).
- **식단 상세 트래킹:** 오늘 추천 식단 외에 내가 실제로 먹은 음식을 기록하고 칼로리를 마이너스하는 직접 기록 기능.
- **고급 분석 리포트:** 주간/월간 운동 소모 칼로리 vs 식단 섭취 칼로리 밸런스 비교 차트 제공.

---

## 4. 코드 수정 시 개발자(또는 AI) 준수 사항

1. **BmrInfoModal 수정:** \* '💡 어떻게 계산되나요?' 문구를 운동 목표에 맞게 수정하고, 활동 유형별 하루 운동 목표(200/300/400/500 kcal)를 명확하게 텍스트로 박아줄 것. (기존 TDEE 곱하기 공식 가이드에서 변경)
2. **Diet.tsx 루프 수정:**
   - `MEAL_CONFIGS.map` 처리 시 반드시 위의 `scaleFactor` 로직을 구현하여 끼니 타이틀 칼로리와 하위 음식 칼로리가 동적으로 변하게 만들 것.
   - 추후 프리미엄 기능(메뉴 대체 버튼 등)이 들어올 수 있도록 카드 UI 내부에 확장 가능한 컴포넌트 공간을 확보할 것.
