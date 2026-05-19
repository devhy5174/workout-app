import {
  WORKOUT_TARGET_KCAL,
  WORKOUT_TARGET_LABELS,
} from "../../utils/dietScaling";

interface DietInfoModalProps {
  onClose: () => void;
  bmr: number | null;
  gender: string | null;
  age: number | null;
  height: number | null;
  weight: number | null;
}

export default function DietInfoModal({
  onClose,
  bmr,
  gender,
  age,
  height,
  weight,
}: DietInfoModalProps) {
  const hasBody = !!(age && height && weight);
  const genderLabel =
    gender === "female" ? "여성" : gender === "male" ? "남성" : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl flex flex-col gap-4 max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="diet-info-title"
      >
        <div className="flex items-center justify-between">
          <p id="diet-info-title" className="font-extrabold text-gray-800">
            운동·식단 칼로리 안내
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-bold"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-extrabold text-gray-800">
            💡 어떻게 계산되나요?
          </p>
          <p className="text-xs text-gray-500 leading-relaxed">
            회원님이 선택한 활동 유형에 맞춰 하루에 운동으로 소모하면 좋은{" "}
            <span className="font-bold text-gray-700">권장 운동 목표</span>를
            안내해 드려요. 상단 트래커는 오늘 실제 걸음 수로 소모한 칼로리와 이
            목표를 실시간으로 비교합니다.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl px-4 py-3 flex flex-col gap-2">
          <p className="text-xs font-extrabold text-gray-700">내 계산 기준</p>
          {hasBody ? (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {genderLabel && (
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400">성별</span>
                    <span className="text-xs font-bold text-gray-700">
                      {genderLabel}
                    </span>
                  </div>
                )}
                {age && (
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400">나이</span>
                    <span className="text-xs font-bold text-gray-700">
                      {age}세
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">키</span>
                  <span className="text-xs font-bold text-gray-700">
                    {height}cm
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">몸무게</span>
                  <span className="text-xs font-bold text-gray-700">
                    {weight}kg
                  </span>
                </div>
              </div>
              {bmr && (
                <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-400">기초대사량(BMR)</span>
                  <span className="text-sm font-extrabold text-primary">
                    {Math.round(bmr).toLocaleString()} kcal
                  </span>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-gray-400">
              마이페이지에서 신체정보를 입력하면 내 BMR을 계산해드려요.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-extrabold text-gray-700 px-1">
            활동 유형별 하루 운동 목표
          </p>
          {WORKOUT_TARGET_LABELS.map(({ type, label, emoji }) => (
            <div
              key={type}
              className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-2.5"
            >
              <span className="text-sm font-bold text-gray-700">
                {emoji} {label}
              </span>
              <span className="text-sm font-extrabold text-primary">
                {WORKOUT_TARGET_KCAL[type]} kcal
              </span>
            </div>
          ))}
        </div>

        <div className="h-px bg-gray-100" />

        <div className="flex flex-col gap-2">
          <p className="text-sm font-extrabold text-gray-800">
            🎯 맞춤 식단 칼로리 가이드
          </p>
          <p className="text-xs text-gray-500 leading-relaxed">
            하단 3끼 추천 식단은 회원님의{" "}
            <span className="font-bold text-gray-700">
              기초대사량(BMR)과 선택하신 활동량, 그리고 감량 목표(−300 kcal)를
              종합하여
            </span>{" "}
            하루에 섭취해야 할 가장 이상적인 칼로리 비율로 나누어 추천해 드려요.
          </p>
          <div className="flex flex-col gap-1.5">
            {[
              {
                label: "체중 감량",
                desc: "기본 계산량에서 −300 kcal 덜 섭취",
                color: "text-blue-500",
              },
              {
                label: "체중 유지",
                desc: "기본 계산량 그대로 섭취",
                color: "text-green-500",
              },
              {
                label: "근육 증량",
                desc: "기본 계산량에서 +300 kcal 더 섭취",
                color: "text-orange-500",
              },
            ].map(({ label, desc, color }) => (
              <div
                key={label}
                className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-2.5"
              >
                <span className="text-sm font-bold text-gray-700">{label}</span>
                <span className={`text-xs font-extrabold ${color}`}>
                  {desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-gray-400 text-center leading-relaxed">
          📝 정보 수정은 마이페이지에서 가능해요
        </p>
      </div>
    </div>
  );
}
