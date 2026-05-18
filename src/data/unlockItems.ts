// src/data/unlockItems.ts

export type UnlockItemType = "title" | "activeBubble" | "postFrame" | "premium";

export type UnlockCategory = "normal" | "premium" | "season";

export interface UnlockCondition {
  monthlyAverageStep?: number;
  consecutiveDays?: number;
}

export interface UnlockItem {
  id: string;
  type: UnlockItemType;
  category: UnlockCategory;
  name: string;
  description: string;
  premium?: boolean;
  premiumOnly?: boolean; // 일반 목록에 표시하되 프리미엄 전용 배지 표시
  preview?: string;
  condition?: UnlockCondition;
}

export const unlockItems: UnlockItem[] = [
  // =========================
  // NORMAL — 칭호
  // =========================
  {
    id: "steady_user_title",
    type: "title",
    category: "normal",
    name: "🌿 꾸준한",
    description: "한달 평균 5,000보 달성",
    condition: { monthlyAverageStep: 5000 },
  },
  {
    id: "sprinter_title",
    type: "title",
    category: "normal",
    name: "⚡️ 액티브 ",
    description: "한달 평균 8,000보 달성",
    condition: { monthlyAverageStep: 8000 },
  },
  {
    id: "walk_king_title",
    type: "title",
    category: "normal",
    name: "👟 만보왕",
    description: "한달 평균 10,000보 달성",
    condition: { monthlyAverageStep: 10000 },
  },

  // =========================
  // NORMAL — 파티 말풍선
  // =========================
  {
    id: "basic_bubble",
    type: "activeBubble",
    category: "normal",
    name: "기본 말풍선",
    description: "기본 제공 말풍선 디자인",
  },
  {
    id: "streak30_bubble",
    type: "activeBubble",
    category: "normal",
    name: "🏆 30일 챌린지",
    description: "30일 연속 운동 달성 보상 말풍선",
    condition: { consecutiveDays: 30 },
  },
  {
    id: "cute_bubble",
    type: "activeBubble",
    category: "premium",
    name: "귀여운 말풍선",
    description: "프리미엄 전용 말풍선",
    premium: true,
  },
  {
    id: "fire_bubble",
    type: "activeBubble",
    category: "premium",
    name: "불꽃 말풍선",
    description: "프리미엄 전용 말풍선",
    premium: true,
  },
  {
    id: "sweat_bubble",
    type: "activeBubble",
    category: "premium",
    name: "땀나는 말풍선",
    description: "프리미엄 전용 말풍선",
    premium: true,
  },
  {
    id: "health_bubble",
    type: "activeBubble",
    category: "premium",
    name: "건강 말풍선",
    description: "프리미엄 전용 말풍선",
    premium: true,
  },
  {
    id: "walk_bubble",
    type: "activeBubble",
    category: "premium",
    name: "산책 말풍선",
    description: "프리미엄 전용 말풍선",
    premium: true,
  },
  {
    id: "commute_home_bubble",
    type: "activeBubble",
    category: "premium",
    name: "퇴근 말풍선",
    description: "프리미엄 전용 말풍선",
    premium: true,
  },
  {
    id: "commute_work_bubble",
    type: "activeBubble",
    category: "premium",
    name: "출근 말풍선",
    description: "프리미엄 전용 말풍선",
    premium: true,
  },
  {
    id: "premium_active_bubble",
    type: "activeBubble",
    category: "premium",
    name: "프리미엄 말풍선",
    description: "프리미엄 전용 그라데이션 말풍선",
    premium: true,
  },

  // =========================
  // NORMAL — 인증카드 프레임
  // =========================
  {
    id: "basic_post_frame",
    type: "postFrame",
    category: "normal",
    name: "기본 프레임",
    description: "기본 제공 인증카드 프레임",
  },
  {
    id: "shining_post_frame",
    type: "postFrame",
    category: "premium",
    name: "골드 프레임",
    description: "황금빛 그라데이션 인증카드 프레임",
    premium: true,
  },
  {
    id: "aurora_post_frame",
    type: "postFrame",
    category: "premium",
    name: "오로라 프레임",
    description: "보랏빛 오로라 인증카드 프레임",
    premium: true,
  },

  // =========================
  // SEASON
  // =========================
  {
    id: "spring_walk_title",
    type: "title",
    category: "season",
    name: "벚꽃 산책러",
    description: "봄 시즌 한정 칭호",
  },

  // =========================
  // PREMIUM
  // =========================
  {
    id: "premium_title",
    type: "title",
    category: "premium",
    name: "💎 프리미엄",
    description: "프리미엄 전용 칭호",
    premium: true,
  },

  {
    id: "premium_no_ads",
    type: "premium",
    category: "premium",
    name: "광고 제거",
    description: "앱 내 광고 완전 제거",
    premium: true,
  },
];
