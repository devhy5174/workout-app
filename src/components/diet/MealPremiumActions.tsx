import { useNavigate } from "react-router-dom";
import { HiArrowPath } from "react-icons/hi2";
import type { MainMealTime } from "../../utils/dietScaling";
import { getPremiumTabPath } from "../../utils/premiumNavigation";

interface MealPremiumActionsProps {
  mealTime: MainMealTime;
  isPremium: boolean;
  canRotate: boolean;
  onRotate: (mealTime: MainMealTime) => void;
}

export default function MealPremiumActions({
  mealTime,
  isPremium,
  canRotate,
  onRotate,
}: MealPremiumActionsProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (isPremium) {
      if (canRotate) onRotate(mealTime);
      return;
    }
    navigate(getPremiumTabPath());
  };

  const ariaLabel = isPremium
    ? "대체 식단 새로고침 — 다른 맞춤 메뉴 보기"
    : "프리미엄 대체 식단 안내 보기";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPremium && !canRotate}
      className="h-7 flex items-center gap-1 px-2 rounded-lg text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 active:bg-primary/15 flex-shrink-0 disabled:opacity-50"
      aria-label={ariaLabel}
    >
      <HiArrowPath className="text-sm text-primary" aria-hidden />
      이 메뉴 싫어요
    </button>
  );
}
