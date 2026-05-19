import { useNavigate } from "react-router-dom";
import { HiLockClosed } from "react-icons/hi2";
import { getPremiumTabPath } from "../../utils/premiumNavigation";

interface PremiumModalProps {
  onClose: () => void;
  title?: string;
  description?: string;
}

export default function PremiumModal({
  onClose,
  title = "프리미엄 전용 기능",
  description = "이 기능은 프리미엄 구독자만 이용할 수 있어요.",
}: PremiumModalProps) {
  const navigate = useNavigate();

  function handleSubscribe() {
    onClose();
    navigate(getPremiumTabPath());
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-xl mx-5 p-6 flex flex-col items-center text-center gap-4 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white p-4 rounded-full shadow-xl">
          <HiLockClosed className="text-3xl text-amber-500" />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-lg font-black text-gray-800">{title}</p>
          <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <button
            type="button"
            onClick={handleSubscribe}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black shadow-lg"
            aria-label="프리미엄 구독 페이지로 이동"
          >
            👑 프리미엄 구독하기
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl font-bold text-sm text-gray-400 bg-gray-50"
            aria-label="닫기"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
