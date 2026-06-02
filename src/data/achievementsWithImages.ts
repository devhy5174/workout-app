// src/data/achievementsWithImages.ts
//
// achievements.ts 의 이미지 버전 — 이모지 대신 스프라이트 시트(bedges.png) 사용
//
// 스프라이트 구조: 5열 × 5행 = 25칸, 왼쪽→오른쪽 / 위→아래 순서
// spriteIndex 0 = (col 0, row 0), 1 = (col 1, row 0), ... 24 = (col 4, row 4)
//
// 업적 순서와 이미지 순서가 1:1 대응하므로 index === ACHIEVEMENTS 배열 순서

import type {
  AchievementCategory,
  AchievementDifficulty,
  AchievementReward,
  AchievementCondition,
} from "./achievements";
export type { AchievementCategory, AchievementDifficulty, AchievementReward, AchievementCondition };
export { ACHIEVEMENT_CATEGORY_LABELS, getAchievementsByCategory, getAchievementById } from "./achievements";

export interface AchievementWithImage {
  id: string;
  category: AchievementCategory;
  difficulty: AchievementDifficulty;
  spriteIndex: number; // 0~24 — bedges.png 내 위치
  name: string;
  description: string;
  condition: AchievementCondition;
  reward?: AchievementReward;
  hidden?: boolean;
}

export const ACHIEVEMENTS_WITH_IMAGES: AchievementWithImage[] = [
  // ── 걷기 입문 ──────────────────────────────────────────
  {
    id: "first_workout",
    category: "walking",
    difficulty: "easy",
    spriteIndex: 0,
    name: "첫걸음",
    description: "첫 운동을 완료했어요",
    condition: { type: "first_workout", target: 1 },
    reward: { type: "speechBubble", rewardId: "basic_bubble", label: "기본 응원 말풍선" },
  },
  {
    id: "total_5000_steps",
    category: "walking",
    difficulty: "easy",
    spriteIndex: 1,
    name: "산책 시작",
    description: "누적 5,000보를 걸었어요",
    condition: { type: "total_steps", target: 5000 },
    reward: { type: "title", rewardId: "steady_user_title", label: "🌿 꾸준한" },
  },
  {
    id: "total_50000_steps",
    category: "walking",
    difficulty: "normal",
    spriteIndex: 2,
    name: "걸음 마스터",
    description: "누적 50,000보를 걸었어요",
    condition: { type: "total_steps", target: 50000 },
    reward: { type: "badge", label: "걸음 마스터 배지" },
  },
  {
    id: "total_1000000_steps",
    category: "walking",
    difficulty: "legend",
    spriteIndex: 3,
    name: "백만 워커",
    description: "누적 1,000,000보를 걸었어요",
    condition: { type: "total_steps", target: 1000000 },
    reward: { type: "frame", rewardId: "million_walker_frame", label: "백만 워커 프레임" },
  },

  // ── 꾸준함 ────────────────────────────────────────────
  {
    id: "streak_3_days",
    category: "streak",
    difficulty: "easy",
    spriteIndex: 4,
    name: "3일 연속 운동",
    description: "3일 연속 운동했어요",
    condition: { type: "streak_days", target: 3 },
    reward: { type: "speechBubble", rewardId: "streak_3_bubble", label: "3일 연속 말풍선" },
  },
  {
    id: "streak_7_days",
    category: "streak",
    difficulty: "normal",
    spriteIndex: 5,
    name: "7일 연속 운동",
    description: "7일 연속 운동했어요",
    condition: { type: "streak_days", target: 7 },
    reward: { type: "frame", rewardId: "streak_7_frame", label: "꾸준한 프레임" },
  },
  {
    id: "streak_30_days",
    category: "streak",
    difficulty: "hard",
    spriteIndex: 6,
    name: "30일 챌린저",
    description: "30일 연속 운동했어요",
    condition: { type: "streak_days", target: 30 },
    reward: { type: "speechBubble", rewardId: "streak30_bubble", label: "30일 챌린지 말풍선" },
  },
  {
    id: "streak_100_days",
    category: "streak",
    difficulty: "legend",
    spriteIndex: 7,
    name: "철인 워커",
    description: "100일 연속 운동했어요",
    condition: { type: "streak_days", target: 100 },
    reward: { type: "title", rewardId: "iron_walker", label: "👑 철인 워커" },
  },

  // ── 걸음수 ────────────────────────────────────────────
  {
    id: "daily_5000_steps",
    category: "steps",
    difficulty: "easy",
    spriteIndex: 8,
    name: "오늘도 충분해",
    description: "하루 5,000보를 달성했어요",
    condition: { type: "daily_steps", target: 5000 },
    reward: { type: "title", rewardId: "enough_today", label: "🌿 오늘도 충분해" },
  },
  {
    id: "daily_10000_steps",
    category: "steps",
    difficulty: "normal",
    spriteIndex: 9,
    name: "액티브",
    description: "하루 10,000보를 달성했어요",
    condition: { type: "daily_steps", target: 10000 },
    reward: { type: "title", rewardId: "active", label: "⚡ 액티브" },
  },
  {
    id: "daily_20000_steps",
    category: "steps",
    difficulty: "hard",
    spriteIndex: 10,
    name: "미친 체력",
    description: "하루 20,000보를 달성했어요",
    condition: { type: "daily_steps", target: 20000 },
    reward: { type: "frame", rewardId: "power_walker_frame", label: "파워워커 프레임" },
  },
  {
    id: "daily_30000_steps",
    category: "steps",
    difficulty: "legend",
    spriteIndex: 11,
    name: "인간 맞나요?",
    description: "하루 30,000보를 달성했어요",
    condition: { type: "daily_steps", target: 30000 },
    reward: { type: "title", rewardId: "alien_walker", label: "👽 인간 맞나요?" },
  },

  // ── 시간대 ────────────────────────────────────────────
  {
    id: "morning_workout_10",
    category: "time",
    difficulty: "normal",
    spriteIndex: 12,
    name: "아침형 인간",
    description: "오전 6~8시에 운동을 10회 완료했어요",
    condition: { type: "time_workout", target: 10, meta: { startHour: 6, endHour: 8 } },
    reward: { type: "speechBubble", rewardId: "morning_bubble", label: "아침 산책 말풍선" },
  },
  {
    id: "night_workout_20",
    category: "time",
    difficulty: "hard",
    spriteIndex: 13,
    name: "밤달리기",
    description: "밤 10시 이후 운동을 20회 완료했어요",
    condition: { type: "time_workout", target: 20, meta: { startHour: 22, endHour: 24 } },
    reward: { type: "speechBubble", rewardId: "night_run_bubble", label: "밤달리기 말풍선" },
  },

  // ── 파티 ──────────────────────────────────────────────
  {
    id: "first_party_join",
    category: "party",
    difficulty: "easy",
    spriteIndex: 14,
    name: "첫 파티",
    description: "처음으로 파티에 가입했어요",
    condition: { type: "party_join", target: 1 },
    reward: { type: "badge", label: "첫 파티 배지" },
  },
  {
    id: "party_goal_first",
    category: "party",
    difficulty: "easy",
    spriteIndex: 15,
    name: "목표 달성",
    description: "파티 목표를 처음 달성했어요",
    condition: { type: "party_goal_success", target: 1 },
    reward: { type: "speechBubble", rewardId: "party_goal_bubble", label: "파티 목표 달성 말풍선" },
  },
  {
    id: "party_mvp_10",
    category: "party",
    difficulty: "hard",
    spriteIndex: 16,
    name: "파티 에이스",
    description: "파티 MVP를 10회 달성했어요",
    condition: { type: "party_mvp", target: 10 },
    reward: { type: "frame", rewardId: "mvp_frame", label: "MVP 프레임" },
  },
  {
    id: "party_goal_50",
    category: "party",
    difficulty: "legend",
    spriteIndex: 17,
    name: "함께 걸어요",
    description: "파티 목표를 50회 달성했어요",
    condition: { type: "party_goal_success", target: 50 },
    reward: { type: "title", rewardId: "together_walker", label: "🤜🤛 함께 걸어요" },
  },

  // ── 인증 ──────────────────────────────────────────────
  {
    id: "first_post",
    category: "post",
    difficulty: "easy",
    spriteIndex: 18,
    name: "첫 인증",
    description: "첫 운동 인증글을 작성했어요",
    condition: { type: "post_create", target: 1 },
    reward: { type: "badge", label: "첫 인증 배지" },
  },
  {
    id: "post_30",
    category: "post",
    difficulty: "normal",
    spriteIndex: 19,
    name: "수다쟁이",
    description: "운동 인증글을 30개 작성했어요",
    condition: { type: "post_create", target: 30 },
    reward: { type: "speechBubble", rewardId: "talker_bubble", label: "수다쟁이 말풍선" },
  },
  {
    id: "post_likes_100",
    category: "post",
    difficulty: "hard",
    spriteIndex: 20,
    name: "인기인",
    description: "인증글 좋아요를 누적 100개 받았어요",
    condition: { type: "post_likes", target: 100 },
    reward: { type: "frame", rewardId: "popular_frame", label: "인기인 프레임" },
  },

  // ── 재미 업적 ─────────────────────────────────────────
  {
    id: "rain_workout_10",
    category: "fun",
    difficulty: "hard",
    spriteIndex: 21,
    name: "비가 와도 간다",
    description: "비 오는 날 운동을 10회 완료했어요",
    condition: { type: "weather_workout", target: 10, meta: { weather: "rain" } },
    reward: { type: "title", rewardId: "rain_walker", label: "🌧 비가 와도 간다" },
  },
  {
    id: "return_after_30_days",
    category: "fun",
    difficulty: "normal",
    spriteIndex: 22,
    name: "유령회원 탈출",
    description: "30일 만에 돌아와 운동했어요",
    condition: { type: "return_after_days", target: 30 },
    reward: { type: "speechBubble", rewardId: "return_bubble", label: "복귀 환영 말풍선" },
  },

  // ── 프리미엄 ──────────────────────────────────────────
  {
    id: "premium_join",
    category: "premium",
    difficulty: "easy",
    spriteIndex: 23,
    name: "후원자",
    description: "프리미엄에 가입했어요",
    condition: { type: "premium_join", target: 1 },
    reward: { type: "title", rewardId: "premium_title", label: "💎 후원자" },
  },
  {
    id: "unlock_8_bubbles",
    category: "premium",
    difficulty: "normal",
    spriteIndex: 24,
    name: "꾸미기 장인",
    description: "말풍선 8개를 해금했어요",
    condition: { type: "unlock_count", target: 8, meta: { unlockType: "speechBubble" } },
    reward: { type: "badge", label: "꾸미기 장인 배지" },
  },
];
