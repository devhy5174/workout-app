import { storage, type RecommendedDiet } from "../utils/storage";
import { useActivityType } from "../context/ActivityTypeContext";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const meals = [
  { time: "아침", emoji: "🌄", items: ["오트밀", "바나나", "우유"], kcal: 350 },
  {
    time: "점심",
    emoji: "☀️",
    items: ["닭가슴살", "현미밥", "샐러드"],
    kcal: 520,
  },
  { time: "저녁", emoji: "🌙", items: [], kcal: 0 },
];

const dinnerRecommend = [
  { name: "삶은계란", emoji: "🥚", kcal: 78 },
  { name: "고구마", emoji: "🍠", kcal: 130 },
  { name: "그릭요거트", emoji: "🥛", kcal: 100 },
];

const DEFAULT_DIET: RecommendedDiet = {
  durationLabel: "오늘 운동 기록이 없어요",
  durationMeals: [
    { emoji: "🥗", name: "채소 샐러드" },
    { emoji: "🍚", name: "현미밥" },
    { emoji: "🐟", name: "생선구이" },
  ],
  tip: "균형 잡힌 한 끼로 하루를 마무리해요.",
};

const kcalGoal = 2000;
export default function Diet() {
  const { selectedActivityType } = useActivityType();
  const [burnedKcal, setBurnedKcal] = useState<number>(0);

  const location = useLocation();
  const savedDiet = storage.getRecommendedDiet();
  const hasWorkout = savedDiet !== null;
  const diet = savedDiet ?? DEFAULT_DIET;

  useEffect(() => {
    const burned = storage.getBurnedKcal() ?? 0;
    setBurnedKcal(burned);
    // 나중에 섭취칼로리도 여기서 읽어옴
  }, [location]);
  return (
    <div className="flex flex-col gap-4 px-4 pt-5 pb-20 h-full overflow-y-auto bg-bg">
      <h2 className="text-2xl font-extrabold text-primary px-1">오늘의 식단</h2>

      {/* 소모 칼로리 카드 */}
      {burnedKcal !== null && (
        <div
          className="rounded-2xl px-5 py-4 flex items-center justify-between"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <span className="text-white font-bold text-sm">
              오늘 소모 칼로리
            </span>
          </div>
          <span className="text-white font-extrabold text-xl">
            {burnedKcal !== null ? burnedKcal.toLocaleString() : "0"} kcal
          </span>
        </div>
      )}

      {/* 칼로리 진행 카드 */}
      <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <span className="font-bold text-gray-700">오늘 칼로리</span>
          </div>
          <span className="font-extrabold text-primary">
            {burnedKcal.toLocaleString()}
            <span className="text-gray-300 font-normal text-sm">
              {" "}
              / {kcalGoal.toLocaleString()} kcal
            </span>
          </span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
            style={{
              width: `${Math.min((burnedKcal / kcalGoal) * 100, 100)}%`,
            }}
          />
        </div>
        <p className="text-xs text-gray-400">
          {Math.min((burnedKcal / kcalGoal) * 100, 100).toFixed(0)}% 달성 · 남은
          칼로리 {Math.max(kcalGoal - burnedKcal, 0).toLocaleString()} kcal
        </p>
      </div>

      {/* 식사 카드 */}
      {meals.map((m) => {
        const isEmpty = m.items.length === 0;
        return (
          <div
            key={m.time}
            className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{m.emoji}</span>
              <div className="flex-1">
                <p className="font-bold text-gray-800">{m.time}</p>
                {isEmpty ? (
                  <p className="text-sm text-gray-400">아직 기록 없음</p>
                ) : (
                  <p className="text-sm text-gray-500">{m.items.join(", ")}</p>
                )}
              </div>
              <p className="text-sm font-extrabold text-primary flex-shrink-0">
                {isEmpty ? "- kcal" : `${m.kcal} kcal`}
              </p>
            </div>

            {/* 저녁 미정 → 추천 */}
            {isEmpty && m.time === "저녁" && (
              <div className="border-t border-gray-50 pt-3 flex flex-col gap-2">
                <p className="text-xs font-bold text-gray-400">
                  🍽️ 저녁 추천 메뉴
                </p>
                <div className="flex gap-2">
                  {dinnerRecommend.map((r) => (
                    <div
                      key={r.name}
                      className="flex-1 bg-primary-light rounded-2xl p-3 flex flex-col items-center gap-1"
                    >
                      <span className="text-2xl">{r.emoji}</span>
                      <p className="text-xs font-bold text-gray-700 text-center">
                        {r.name}
                      </p>
                      <p className="text-[10px] text-gray-400">{r.kcal} kcal</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* 배너 */}
      <div className="rounded-2xl bg-gradient-to-r from-primary to-secondary p-4 flex items-center gap-3">
        <span className="text-2xl">💪</span>
        <p className="text-white font-bold text-sm">
          {hasWorkout
            ? "운동 후 30분 이내 단백질을 섭취하세요!"
            : selectedActivityType
              ? `${selectedActivityType.emoji} 오늘 운동하면 ${selectedActivityType.name} 맞춤 식단을 받아요!`
              : "오늘 운동하고 맞춤 식단을 받아보세요!"}
        </p>
      </div>

      {/* 운동 후 추천 식단 (운동 완료 시) */}
      {hasWorkout && (
        <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="font-extrabold text-gray-800 text-sm">
              운동 후 추천 식단 🥗
            </p>
            <span className="text-xs font-bold text-primary bg-primary-light rounded-full px-2 py-0.5">
              오늘 운동 기반
            </span>
          </div>

          <div>
            <p className="text-[11px] text-gray-400 font-semibold mb-2">
              {diet.durationLabel}
            </p>
            <div className="flex gap-2 flex-wrap">
              {diet.durationMeals.map((m) => (
                <span
                  key={m.name}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-50 border border-gray-100"
                >
                  {m.emoji} {m.name}
                </span>
              ))}
            </div>
          </div>

          {diet.characterMeals && diet.characterName && (
            <div className="border-t border-gray-50 pt-3">
              <p className="text-[11px] text-gray-400 font-semibold mb-2">
                {diet.characterEmoji} {diet.characterName} 맞춤 식단
              </p>
              <div className="flex gap-2 flex-wrap mb-2">
                {diet.characterMeals.map((m) => (
                  <span
                    key={m.name}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                    }}
                  >
                    {m.emoji} {m.name}
                  </span>
                ))}
              </div>
              {diet.tip && (
                <p className="text-[11px] text-gray-400 leading-snug">
                  💡 {diet.tip}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 캐릭터 맞춤 식단 (운동 전 / 캐릭터 선택 시) */}
      {!hasWorkout && selectedActivityType && (
        <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{selectedActivityType.emoji}</span>
            <div>
              <p className="text-xs text-gray-400 font-semibold">
                {selectedActivityType.name} 맞춤 추천
              </p>
              <p className="font-bold text-gray-800 text-sm">
                {selectedActivityType.dietProfile.description}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {selectedActivityType.dietProfile.recommendedFoods.map((food) => (
              <span
                key={food}
                className="px-3 py-1.5 rounded-full text-xs font-bold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                }}
              >
                {food}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 leading-snug">
            💡 {selectedActivityType.dietProfile.mealTip}
          </p>
        </div>
      )}

      {/* 기본 추천 식단 (운동 없음 + 캐릭터 없음) */}
      {!hasWorkout && !selectedActivityType && (
        <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-3">
          <p className="font-extrabold text-gray-800 text-sm">
            기본 추천 식단 🥗
          </p>
          <div className="flex gap-2 flex-wrap">
            {DEFAULT_DIET.durationMeals.map((m) => (
              <span
                key={m.name}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-50 border border-gray-100"
              >
                {m.emoji} {m.name}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 leading-snug">
            💡 {DEFAULT_DIET.tip}
          </p>
        </div>
      )}
    </div>
  );
}
