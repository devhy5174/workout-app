import { useState } from "react";
import { useActivityType } from "../../context/ActivityTypeContext";
import { activityTypes } from "../../data/activityTypes";
import Modal from "../../components/ui/Modal";

export default function ActivityTypePage() {
  const { selectedId, selectActivityType } = useActivityType();
  const selected = selectedId;
  const [modalOpen, setModalOpen] = useState(false);

  const selectedCharacter = activityTypes.find((c) => c.id === selected);

  function handleConfirm() {
    setModalOpen(false);
  }

  return (
    <div className="flex flex-col gap-4 p-5 h-full overflow-y-auto pb-20">
      <div className="mb-1">
        <h2 className="text-2xl font-extrabold text-[var(--color-primary)]">
          활동 유형 선택
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          나에게 맞는 운동 스타일을 골라봐!
        </p>
      </div>

      {activityTypes.map((c) => {
        const isSelected = selected === c.id;
        return (
          <button
            key={c.id}
            onClick={() => selectActivityType(c.id)}
            className={`w-full rounded-3xl p-5 text-left transition-all duration-200 border-2 ${
              isSelected
                ? `${c.bg} ${c.border} shadow-md scale-[1.02]`
                : "bg-white border-transparent shadow-sm"
            }`}
          >
            <div className="flex items-center gap-4">
              {/* 이모지 아바타 */}
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center shadow-sm flex-shrink-0`}
              >
                <span className="text-3xl">{c.emoji}</span>
              </div>

              {/* 텍스트 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-gray-800 text-base">
                    {c.name}
                  </span>
                  {isSelected && (
                    <span className="text-xs font-bold text-white bg-[var(--color-primary)] rounded-full px-2 py-0.5">
                      선택됨
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{c.style}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-xs font-semibold text-gray-500">
                    🔥 분당 {c.kcalPerMin}kcal 소모
                  </span>
                </div>
              </div>

              {/* 선택 체크 */}
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected
                    ? `bg-gradient-to-br ${c.gradient} border-transparent`
                    : "border-gray-200"
                }`}
              >
                {isSelected && (
                  <span className="text-white text-xs font-bold">✓</span>
                )}
              </div>
            </div>
          </button>
        );
      })}

      <Modal
        isOpen={modalOpen}
        title="캐릭터 선택 완료"
        message={`${selectedCharacter?.name} 캐릭터를 선택했어요!`}
        onConfirm={handleConfirm}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
