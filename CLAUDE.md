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
