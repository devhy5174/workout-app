export type MbtiAxis = "E" | "W" | "R" | "F" | "D" | "M" | "N";

export interface MbtiQuizOption {
  label: string;
  sub: string;
  value: string;
}

export interface MbtiQuizQuestion {
  emoji: string;
  question: string;
  options: [MbtiQuizOption, MbtiQuizOption];
}

export const MBTI_QUIZ_QUESTIONS: MbtiQuizQuestion[] = [
  {
    emoji: "📅",
    question: "주로 언제 운동해요?",
    options: [
      { label: "평일도 꼬박꼬박", sub: "매일 or 평일 중심", value: "E" },
      { label: "주말에 몰아서", sub: "주말이 주 활동 시간", value: "W" },
    ],
  },
  {
    emoji: "🏃",
    question: "운동 스타일이 어때요?",
    options: [
      { label: "빠르게 땀 흘리기", sub: "러닝 · 파워워킹", value: "R" },
      { label: "여유롭게 즐기기", sub: "산책 · 등산", value: "W" },
    ],
  },
  {
    emoji: "🎯",
    question: "운동할 때 뭘 더 챙겨요?",
    options: [
      { label: "칼로리 태우기", sub: "땀 뻘뻘 = 성공", value: "F" },
      { label: "거리 채우기", sub: "km 숫자가 쌓여야 뿌듯", value: "D" },
    ],
  },
  {
    emoji: "⏰",
    question: "운동은 언제가 좋아요?",
    options: [
      { label: "상쾌한 아침", sub: "해 뜨기 전 or 오전", value: "M" },
      { label: "여유로운 저녁", sub: "퇴근 후 or 야간", value: "N" },
    ],
  },
];
