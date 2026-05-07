import { useState } from "react";

const characters = [
  {
    id: 1,
    emoji: "🚶",
    name: "워커",
    style: "매일 꾸준한 산책",
    bonus: "연속 운동 포인트 2배",
    bonusIcon: "🔥",
    color: "from-green-400 to-teal-400",
    bg: "bg-green-50",
    border: "border-green-400",
  },
  {
    id: 2,
    emoji: "🏃",
    name: "스프린터",
    style: "단거리 질주 특화",
    bonus: "목표 달성 포인트 2배",
    bonusIcon: "⚡",
    color: "from-orange-400 to-red-400",
    bg: "bg-orange-50",
    border: "border-orange-400",
  },
  {
    id: 3,
    emoji: "🧘",
    name: "요가마스터",
    style: "꾸준함과 마음의 균형",
    bonus: "7일 연속 달성 보너스",
    bonusIcon: "✨",
    color: "from-purple-400 to-pink-400",
    bg: "bg-purple-50",
    border: "border-purple-400",
  },
  {
    id: 4,
    emoji: "🏋️",
    name: "파워리프터",
    style: "집중 고강도 운동",
    bonus: "주간 목표 달성 보너스",
    bonusIcon: "💪",
    color: "from-red-500 to-rose-400",
    bg: "bg-red-50",
    border: "border-red-400",
  },
  {
    id: 5,
    emoji: "🌊",
    name: "스위머",
    style: "물 속에서 온몸 단련",
    bonus: "포인트 1.5배 적립",
    bonusIcon: "💎",
    color: "from-blue-400 to-cyan-400",
    bg: "bg-blue-50",
    border: "border-blue-400",
  },
  {
    id: 6,
    emoji: "🚵",
    name: "어드벤처러",
    style: "야외 등산 & 탐험",
    bonus: "파티 참여 보너스",
    bonusIcon: "🗺️",
    color: "from-yellow-400 to-orange-400",
    bg: "bg-yellow-50",
    border: "border-yellow-400",
  },
];

export default function Character() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-4 p-5 h-full overflow-y-auto pb-20">
      <div className="mb-1">
        <h2 className="text-2xl font-extrabold text-[var(--color-primary)]">
          캐릭터 선택
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          나에게 맞는 운동 스타일을 골라봐!
        </p>
      </div>

      {characters.map((c) => {
        const isSelected = selected === c.id;
        return (
          <button
            key={c.id}
            onClick={() => setSelected(c.id)}
            className={`w-full rounded-3xl p-5 text-left transition-all duration-200 border-2 ${
              isSelected
                ? `${c.bg} ${c.border} shadow-md scale-[1.02]`
                : "bg-white border-transparent shadow-sm"
            }`}
          >
            <div className="flex items-center gap-4">
              {/* 이모지 아바타 */}
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center shadow-sm flex-shrink-0`}
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
                  <span className="text-sm">{c.bonusIcon}</span>
                  <span className="text-xs font-semibold text-gray-600">
                    {c.bonus}
                  </span>
                </div>
              </div>

              {/* 선택 체크 */}
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected
                    ? `bg-gradient-to-br ${c.color} border-transparent`
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

      {/* 선택 확인 버튼 */}
      <button
        disabled={selected === null}
        className={`mt-2 w-full py-4 rounded-2xl font-extrabold text-base transition-all ${
          selected !== null
            ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md active:scale-95"
            : "bg-gray-100 text-gray-300 cursor-not-allowed"
        }`}
      >
        {selected !== null
          ? `${characters.find((c) => c.id === selected)?.name} 선택 완료! 🎉`
          : "캐릭터를 선택해주세요"}
      </button>
    </div>
  );
}
