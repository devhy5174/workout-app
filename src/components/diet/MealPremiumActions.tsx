import { useState } from "react";
import { HiArrowPath, HiLockClosed } from "react-icons/hi2";
import type { MainMealTime } from "../../utils/dietScaling";
import PremiumModal from "../ui/PremiumModal";

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
  const [showModal, setShowModal] = useState(false);

  function handleClick() {
    if (isPremium) {
      if (canRotate) onRotate(mealTime);
      return;
    }
    setShowModal(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPremium && !canRotate}
        className="h-7 flex items-center gap-1 px-2 rounded-lg text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 active:bg-primary/15 disabled:opacity-50 flex-shrink-0"
        aria-label={
          isPremium
            ? "대체 식단 새로고침 — 다른 맞춤 메뉴 보기"
            : "프리미엄 대체 식단 안내 보기"
        }
      >
        <HiArrowPath className="text-sm text-primary" aria-hidden />
        이 메뉴 싫어요
        {!isPremium && <HiLockClosed className="text-amber-500" aria-hidden />}
      </button>

      {showModal && (
        <PremiumModal
          onClose={() => setShowModal(false)}
          title="프리미엄 전용 기능"
          description="대체 식단 새로고침은 프리미엄 구독자만 사용할 수 있어요. 구독하고 내 입맛에 맞는 식단을 골라보세요!"
        />
      )}
    </>
  );
}
