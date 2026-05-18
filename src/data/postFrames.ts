export interface PostFrameStyle {
  id: string;
  premium: boolean;
  /** 그라데이션 테두리 래퍼 Tailwind 클래스 (premium만 사용) */
  wrapperClass: string;
  /** 반짝이 애니메이션 클래스 */
  animationClass: string;
  /** Step 프리미엄 탭 미리보기 레이블 컬러 */
  labelColorClass: string;
}

export const POST_FRAMES: Record<string, PostFrameStyle> = {
  basic_post_frame: {
    id: "basic_post_frame",
    premium: false,
    wrapperClass: "",
    animationClass: "",
    labelColorClass: "text-stone-400",
  },
  shining_post_frame: {
    id: "shining_post_frame",
    premium: true,
    wrapperClass:
      "bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500",
    animationClass: "animate-premium-bubble",
    labelColorClass: "text-amber-500",
  },
  aurora_post_frame: {
    id: "aurora_post_frame",
    premium: true,
    wrapperClass:
      "bg-gradient-to-br from-violet-400 via-pink-400 to-cyan-400",
    animationClass: "animate-premium-bubble",
    labelColorClass: "text-violet-500",
  },
};

export function resolvePostFrame(frameId: string | null | undefined): PostFrameStyle {
  if (frameId && POST_FRAMES[frameId]) return POST_FRAMES[frameId];
  return POST_FRAMES.basic_post_frame;
}
