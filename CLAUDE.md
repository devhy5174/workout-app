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
