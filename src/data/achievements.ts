// src/data/achievements.ts
//
// ─── 업적 정의 파일 ────────────────────────────────────────────────────────────
// 이 파일에서만 업적 데이터를 관리합니다. UI·계산 로직은 건드릴 필요 없습니다.
//
// ✅ 기존 조건 타입으로 업적 추가할 때
//   → ACHIEVEMENTS 배열에 항목만 추가 (AchievementConditionType 확인 후 사용)
//
// ✅ 새로운 조건 타입이 필요할 때 (3단계)
//   1. AchievementConditionType 에 타입 추가
//   2. src/lib/achievementStatsService.ts 의 AchievementStats 에 필드 추가
//   3. src/lib/achievementStatsService.ts 의 computeCurrentValue() switch 에 case 추가
//
// ✅ hidden: true
//   → 달성 전까지 이름·설명을 "???" 로 숨김. 달성 시 자동 공개.
//
// ✅ reward 필드
//   → 현재 UI에서 표시 안 함 (배지 수집 방식).
//   → 추후 Supabase user_achievements 테이블 연동 시 보상 자동 지급에 활용 예정.
//   → rewardId 는 src/data/unlockItems.ts 의 id 와 매핑해야 실제 아이템 해금 가능.

export type AchievementCategory =
  | "walking"
  | "streak"
  | "time"
  | "steps"
  | "party"
  | "post"
  | "fun"
  | "premium";

export type AchievementDifficulty = "easy" | "normal" | "hard" | "legend";

export type AchievementRewardType =
  | "title"
  | "speechBubble"
  | "frame"
  | "character"
  | "badge"
  | "none";

export type AchievementConditionType =
  | "first_workout"
  | "total_steps"
  | "daily_steps"
  | "streak_days"
  | "party_join"
  | "party_create"
  | "party_goal_success"
  | "party_mvp"
  | "post_create"
  | "post_likes"
  | "time_workout"
  | "weather_workout"
  | "season_workout"
  | "return_after_days"
  | "premium_join"
  | "unlock_count";

export interface AchievementReward {
  type: AchievementRewardType;
  rewardId?: string;
  label: string;
}

export interface AchievementCondition {
  type: AchievementConditionType;
  target: number;
  meta?: {
    startHour?: number;
    endHour?: number;
    weather?: "rain" | "snow";
    season?: "summer" | "winter";
    unlockType?: "speechBubble" | "frame" | "character" | "title";
  };
}

export interface Achievement {
  id: string;
  category: AchievementCategory;
  difficulty: AchievementDifficulty;
  icon: string;
  name: string;
  description: string;
  condition: AchievementCondition;
  reward?: AchievementReward;
  hidden?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_workout",
    category: "walking",
    difficulty: "easy",
    icon: "🥾",
    name: "첫걸음",
    description: "첫 운동을 완료했어요",
    condition: { type: "first_workout", target: 1 },
    reward: { type: "speechBubble", rewardId: "basic_bubble", label: "기본 응원 말풍선" },
  },
  {
    id: "total_5000_steps",
    category: "walking",
    difficulty: "easy",
    icon: "🌿",
    name: "산책 시작",
    description: "누적 5,000보를 걸었어요",
    condition: { type: "total_steps", target: 5000 },
    reward: { type: "title", rewardId: "steady_user_title", label: "🌿 꾸준한" },
  },
  {
    id: "total_50000_steps",
    category: "walking",
    difficulty: "normal",
    icon: "🚶",
    name: "걸음 마스터",
    description: "누적 50,000보를 걸었어요",
    condition: { type: "total_steps", target: 50000 },
    reward: { type: "badge", label: "걸음 마스터 배지" },
  },
  {
    id: "total_1000000_steps",
    category: "walking",
    difficulty: "legend",
    icon: "👣",
    name: "백만 워커",
    description: "누적 1,000,000보를 걸었어요",
    condition: { type: "total_steps", target: 1000000 },
    reward: { type: "frame", rewardId: "million_walker_frame", label: "백만 워커 프레임" },
  },

  {
    id: "streak_3_days",
    category: "streak",
    difficulty: "easy",
    icon: "🔥",
    name: "3일 연속 운동",
    description: "3일 연속 운동했어요",
    condition: { type: "streak_days", target: 3 },
    reward: { type: "speechBubble", rewardId: "streak_3_bubble", label: "3일 연속 말풍선" },
  },
  {
    id: "streak_7_days",
    category: "streak",
    difficulty: "normal",
    icon: "🌟",
    name: "7일 연속 운동",
    description: "7일 연속 운동했어요",
    condition: { type: "streak_days", target: 7 },
    reward: { type: "frame", rewardId: "streak_7_frame", label: "꾸준한 프레임" },
  },
  {
    id: "streak_30_days",
    category: "streak",
    difficulty: "hard",
    icon: "🏆",
    name: "30일 챌린저",
    description: "30일 연속 운동했어요",
    condition: { type: "streak_days", target: 30 },
    reward: { type: "speechBubble", rewardId: "streak30_bubble", label: "30일 챌린지 말풍선" },
  },
  {
    id: "streak_100_days",
    category: "streak",
    difficulty: "legend",
    icon: "👑",
    name: "철인 워커",
    description: "100일 연속 운동했어요",
    condition: { type: "streak_days", target: 100 },
    reward: { type: "title", rewardId: "iron_walker", label: "👑 철인 워커" },
  },

  {
    id: "daily_5000_steps",
    category: "steps",
    difficulty: "easy",
    icon: "🌿",
    name: "오늘도 충분해",
    description: "하루 5,000보를 달성했어요",
    condition: { type: "daily_steps", target: 5000 },
    reward: { type: "title", rewardId: "enough_today", label: "🌿 오늘도 충분해" },
  },
  {
    id: "daily_10000_steps",
    category: "steps",
    difficulty: "normal",
    icon: "⚡",
    name: "액티브",
    description: "하루 10,000보를 달성했어요",
    condition: { type: "daily_steps", target: 10000 },
    reward: { type: "title", rewardId: "active", label: "⚡ 액티브" },
  },
  {
    id: "daily_20000_steps",
    category: "steps",
    difficulty: "hard",
    icon: "🚀",
    name: "미친 체력",
    description: "하루 20,000보를 달성했어요",
    condition: { type: "daily_steps", target: 20000 },
    reward: { type: "frame", rewardId: "power_walker_frame", label: "파워워커 프레임" },
  },
  {
    id: "daily_30000_steps",
    category: "steps",
    difficulty: "legend",
    icon: "👽",
    name: "인간 맞나요?",
    description: "하루 30,000보를 달성했어요",
    condition: { type: "daily_steps", target: 30000 },
    reward: { type: "title", rewardId: "alien_walker", label: "👽 인간 맞나요?" },
  },

  {
    id: "morning_workout_10",
    category: "time",
    difficulty: "normal",
    icon: "🌄",
    name: "아침형 인간",
    description: "오전 6~8시에 운동을 10회 완료했어요",
    condition: {
      type: "time_workout",
      target: 10,
      meta: { startHour: 6, endHour: 8 },
    },
    reward: { type: "speechBubble", rewardId: "morning_bubble", label: "아침 산책 말풍선" },
  },
  {
    id: "night_workout_20",
    category: "time",
    difficulty: "hard",
    icon: "🌙",
    name: "밤달리기",
    description: "밤 10시 이후 운동을 20회 완료했어요",
    condition: {
      type: "time_workout",
      target: 20,
      meta: { startHour: 22, endHour: 24 },
    },
    reward: { type: "speechBubble", rewardId: "night_run_bubble", label: "밤달리기 말풍선" },
  },

  {
    id: "first_party_join",
    category: "party",
    difficulty: "easy",
    icon: "👋",
    name: "첫 파티",
    description: "처음으로 파티에 가입했어요",
    condition: { type: "party_join", target: 1 },
    reward: { type: "badge", label: "첫 파티 배지" },
  },
  {
    id: "party_goal_first",
    category: "party",
    difficulty: "easy",
    icon: "🎯",
    name: "목표 달성",
    description: "파티 목표를 처음 달성했어요",
    condition: { type: "party_goal_success", target: 1 },
    reward: { type: "speechBubble", rewardId: "party_goal_bubble", label: "파티 목표 달성 말풍선" },
  },
  {
    id: "party_mvp_10",
    category: "party",
    difficulty: "hard",
    icon: "🏅",
    name: "파티 에이스",
    description: "파티 MVP를 10회 달성했어요",
    condition: { type: "party_mvp", target: 10 },
    reward: { type: "frame", rewardId: "mvp_frame", label: "MVP 프레임" },
  },
  {
    id: "party_goal_50",
    category: "party",
    difficulty: "legend",
    icon: "🤜🤛",
    name: "함께 걸어요",
    description: "파티 목표를 50회 달성했어요",
    condition: { type: "party_goal_success", target: 50 },
    reward: { type: "title", rewardId: "together_walker", label: "🤜🤛 함께 걸어요" },
  },

  {
    id: "first_post",
    category: "post",
    difficulty: "easy",
    icon: "✏️",
    name: "첫 인증",
    description: "첫 운동 인증글을 작성했어요",
    condition: { type: "post_create", target: 1 },
    reward: { type: "badge", label: "첫 인증 배지" },
  },
  {
    id: "post_30",
    category: "post",
    difficulty: "normal",
    icon: "💬",
    name: "수다쟁이",
    description: "운동 인증글을 30개 작성했어요",
    condition: { type: "post_create", target: 30 },
    reward: { type: "speechBubble", rewardId: "talker_bubble", label: "수다쟁이 말풍선" },
  },
  {
    id: "post_likes_100",
    category: "post",
    difficulty: "hard",
    icon: "👏",
    name: "인기인",
    description: "인증글 좋아요를 누적 100개 받았어요",
    condition: { type: "post_likes", target: 100 },
    reward: { type: "frame", rewardId: "popular_frame", label: "인기인 프레임" },
  },

  {
    id: "rain_workout_10",
    category: "fun",
    difficulty: "hard",
    icon: "🌧",
    name: "비가 와도 간다",
    description: "비 오는 날 운동을 10회 완료했어요",
    condition: {
      type: "weather_workout",
      target: 10,
      meta: { weather: "rain" },
    },
    reward: { type: "title", rewardId: "rain_walker", label: "🌧 비가 와도 간다" },
  },
  {
    id: "return_after_30_days",
    category: "fun",
    difficulty: "normal",
    icon: "👻",
    name: "유령회원 탈출",
    description: "30일 만에 돌아와 운동했어요",
    condition: { type: "return_after_days", target: 30 },
    reward: { type: "speechBubble", rewardId: "return_bubble", label: "복귀 환영 말풍선" },
  },

  {
    id: "premium_join",
    category: "premium",
    difficulty: "easy",
    icon: "💎",
    name: "후원자",
    description: "프리미엄에 가입했어요",
    condition: { type: "premium_join", target: 1 },
    reward: { type: "title", rewardId: "premium_title", label: "💎 후원자" },
  },
  {
    id: "unlock_8_bubbles",
    category: "premium",
    difficulty: "normal",
    icon: "✨",
    name: "꾸미기 장인",
    description: "말풍선 8개를 해금했어요",
    condition: {
      type: "unlock_count",
      target: 8,
      meta: { unlockType: "speechBubble" },
    },
    reward: { type: "badge", label: "꾸미기 장인 배지" },
  },
];

export const ACHIEVEMENT_CATEGORY_LABELS: Record<AchievementCategory, string> = {
  walking: "걷기 입문",
  streak: "꾸준함",
  time: "시간대",
  steps: "걸음수",
  party: "파티",
  post: "인증",
  fun: "재미 업적",
  premium: "프리미엄",
};

export function getAchievementsByCategory(category: AchievementCategory) {
  return ACHIEVEMENTS.filter((achievement) => achievement.category === category);
}

export function getAchievementById(id: string) {
  return ACHIEVEMENTS.find((achievement) => achievement.id === id);
}