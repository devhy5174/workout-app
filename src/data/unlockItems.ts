// src/data/unlockItems.ts

export type UnlockItemType = "title" | "activeBubble" | "postFrame" | "premium";

export type UnlockCategory = "normal" | "premium" | "season";

export interface UnlockCondition {
  monthlyAverageStep?: number;
}

export interface UnlockItem {
  id: string;
  type: UnlockItemType;
  category: UnlockCategory;
  name: string;
  description: string;
  premium?: boolean;
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
    name: "💨 산책중독",
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
    id: "cute_bubble",
    type: "activeBubble",
    category: "normal",
    name: "귀여운 말풍선",
    description: "한달 평균 3,000보 달성",
    condition: { monthlyAverageStep: 3000 },
  },
  {
    id: "fire_bubble",
    type: "activeBubble",
    category: "normal",
    name: "불꽃 말풍선",
    description: "한달 평균 7,000보 달성",
    condition: { monthlyAverageStep: 7000 },
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
    category: "normal",
    name: "빛나는 프레임",
    description: "한달 평균 6,000보 달성",
    condition: { monthlyAverageStep: 6000 },
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
    name: "✨ 프리미엄 칭호",
    description: "프리미엄 전용 칭호",
    premium: true,
  },
  {
    id: "premium_active_bubble",
    type: "activeBubble",
    category: "premium",
    name: "프리미엄 활동중 말풍선",
    description: "파티 활동 시 특별 말풍선 표시",
    preview: "premiumBubble",
    premium: true,
  },
  {
    id: "premium_post_frame",
    type: "postFrame",
    category: "premium",
    name: "특별 인증카드 테마",
    description: "운동 인증 카드 전용 프레임",
    preview: "premiumFrame",
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
