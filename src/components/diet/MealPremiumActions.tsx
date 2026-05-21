import { HiArrowPath } from "react-icons/hi2";
import type { MainMealTime } from "../../utils/dietScaling";

interface MealPremiumActionsProps {
  mealTime: MainMealTime;
  isPremium: boolean;
  canRotate: boolean;
  onRotate: (mealTime: MainMealTime) => void;
}

export default function MealPremiumActions({
  mealTime,
  canRotate,
  onRotate,
}: MealPremiumActionsProps) {
  return (
    <button
      type="button"
      onClick={() => { if (canRotate) onRotate(mealTime); }}
      disabled={!canRotate}
      className="h-7 flex items-center gap-1 px-2 rounded-lg text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 active:bg-primary/15 disabled:opacity-50 flex-shrink-0"
      aria-label="대체 식단 새로고침 — 다른 맞춤 메뉴 보기"
    >
      <HiArrowPath className="text-sm text-primary" aria-hidden />
      이 메뉴 싫어요
    </button>
  );
}
