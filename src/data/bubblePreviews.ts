/** 파티 말풍선 / STEP 미리보기 공통 스타일 */
export interface BubblePreview {
  text: string;
  /** Tailwind bg 클래스 (단색 또는 그라데이션) */
  colorClass: string;
  /** true → 프리미엄 전용 (반짝이 효과 적용) */
  premium: boolean;
}

export const BUBBLE_PREVIEWS: Record<string, BubblePreview> = {
  // ── 무료 ──────────────────────────────────────
  basic_bubble: {
    text: "운동 중 💪",
    colorClass: "bg-emerald-500",
    premium: false,
  },

  // ── 프리미엄 전용 ──────────────────────────────
  cute_bubble: {
    text: "오늘도 꽃길 🌸",
    colorClass: "bg-gradient-to-r from-pink-400 to-rose-500",
    premium: true,
  },
  fire_bubble: {
    text: "불태워 🔥",
    colorClass: "bg-gradient-to-r from-orange-500 to-red-500",
    premium: true,
  },
  sweat_bubble: {
    text: "땀나는 중 💦",
    colorClass: "bg-gradient-to-r from-sky-400 to-cyan-500",
    premium: true,
  },
  health_bubble: {
    text: "건강 적립중 💚",
    colorClass: "bg-gradient-to-r from-teal-400 to-green-500",
    premium: true,
  },
  walk_bubble: {
    text: "산책 중 🌿",
    colorClass: "bg-gradient-to-r from-lime-400 to-emerald-400",
    premium: true,
  },
  commute_home_bubble: {
    text: "퇴근 중 🎒",
    colorClass: "bg-gradient-to-r from-amber-400 to-yellow-400",
    premium: true,
  },
  commute_work_bubble: {
    text: "출근 중 ☕",
    colorClass: "bg-gradient-to-r from-blue-400 to-indigo-500",
    premium: true,
  },
  premium_active_bubble: {
    text: "운동 중 ✨",
    colorClass: "bg-gradient-to-r from-violet-500 to-purple-600",
    premium: true,
  },
};

export const DEFAULT_PARTY_BUBBLE: BubblePreview = {
  text: "운동 중 💪",
  colorClass: "bg-emerald-500",
  premium: false,
};

export function resolveBubblePreview(
  activeBubbleId: string | null | undefined,
): BubblePreview {
  if (activeBubbleId && BUBBLE_PREVIEWS[activeBubbleId]) {
    return BUBBLE_PREVIEWS[activeBubbleId];
  }
  return DEFAULT_PARTY_BUBBLE;
}
