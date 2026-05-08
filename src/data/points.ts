export const POINT_RULES = {
  PER_KM: 50,
  GOAL_BONUS: 100,
  STREAK_7_BONUS: 200,
  PARTY_JOIN: 30,
  WEEKEND_BONUS: 50,
} as const;

export const POINT_EXCHANGE = [
  { name: '스타벅스 아메리카노', points: 3000 },
  { name: '이디야 카페라떼', points: 2000 },
  { name: '편의점 상품권', points: 1000 },
];
