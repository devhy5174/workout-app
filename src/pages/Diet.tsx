import { useActivityType } from "../context/ActivityTypeContext";
import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { storage, type RecommendedDiet } from "../utils/storage";
import { calculateBMR, calculateDailyKcal } from "../utils/bmr";
import { getMenusByMealTime, type RecommendedMenu, type MealTime } from "../data/diet";
import type { ActivityTypes } from "../data/activityTypes";

const DEFAULT_DIET: RecommendedDiet = {
  durationLabel: "오늘 운동 기록이 없어요",
  durationMeals: [
    { emoji: "🥗", name: "채소 샐러드" },
    { emoji: "🍚", name: "현미밥" },
    { emoji: "🐟", name: "생선구이" },
  ],
  tip: "균형 잡힌 한 끼로 하루를 마무리해요.",
};

const MEAL_CONFIGS: { time: MealTime; label: string; emoji: string }[] = [
  { time: "breakfast", label: "아침", emoji: "🌅" },
  { time: "lunch", label: "점심", emoji: "☀️" },
  { time: "dinner", label: "저녁", emoji: "🌙" },
];

function getBestMenu(
  mealTime: MealTime,
  activityType: ActivityTypes | null,
): RecommendedMenu | null {
  const menus = getMenusByMealTime(mealTime);
  if (!activityType) return menus[0] ?? null;
  return menus.find((m) => m.forCharacters.includes(activityType)) ?? menus[0] ?? null;
}

function BmrInfoModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <p className="font-extrabold text-gray-800">칼로리 계산 방식</p>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-bold"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 어떻게 계산되나요 */}
        <div className="flex flex-col gap-2.5">
          <p className="text-sm font-extrabold text-gray-800">💡 어떻게 계산되나요?</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Harris-Benedict 공식으로 기초대사량(BMR)을
            계산하고 활동 유형별 배율을 곱해요.
          </p>
          <div className="flex flex-col gap-1.5">
            {[
              { label: "산책러", emoji: "🚶", multiplier: "× 1.375" },
              { label: "파워워커", emoji: "🚶‍♂️", multiplier: "× 1.55" },
              { label: "러너", emoji: "🏃", multiplier: "× 1.725" },
              { label: "등산가", emoji: "🏔️", multiplier: "× 1.55" },
            ].map(({ label, emoji, multiplier }) => (
              <div
                key={label}
                className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-2.5"
              >
                <span className="text-sm font-bold text-gray-700">
                  {emoji} {label}
                </span>
                <span
                  className="text-sm font-extrabold"
                  style={{ color: "var(--color-primary)" }}
                >
                  {multiplier}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 구분선 */}
        <div className="h-px bg-gray-100" />

        {/* 목표별 조정 가이드 */}
        <div className="flex flex-col gap-2.5">
          <p className="text-sm font-extrabold text-gray-800">🎯 목표별 조정 가이드</p>
          <div className="flex flex-col gap-1.5">
            {[
              { label: "감량", desc: "− 300~500 kcal", color: "text-blue-500" },
              { label: "유지", desc: "그대로", color: "text-green-500" },
              { label: "증량", desc: "+ 300~500 kcal", color: "text-orange-500" },
            ].map(({ label, desc, color }) => (
              <div
                key={label}
                className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-2.5"
              >
                <span className="text-sm font-bold text-gray-700">{label}</span>
                <span className={`text-sm font-extrabold ${color}`}>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Diet() {
  const { selectedActivityType } = useActivityType();
  const { userProfile } = useUser();
  const [burnedKcal, setBurnedKcal] = useState<number>(0);
  const [showBmrInfo, setShowBmrInfo] = useState(false);
  const location = useLocation();

  const savedDiet = storage.getRecommendedDiet();
  const hasWorkout = savedDiet !== null;
  const diet = savedDiet ?? DEFAULT_DIET;

  useEffect(() => {
    setBurnedKcal(storage.getBurnedKcal() ?? 0);
  }, [location]);

  const activityType = selectedActivityType?.type ?? null;
  const hasBodyData = !!(userProfile?.weight && userProfile?.height);

  const dailyKcal =
    hasBodyData && activityType
      ? calculateDailyKcal(
          calculateBMR(
            userProfile!.gender ?? "male",
            userProfile!.weight!,
            userProfile!.height!,
            userProfile!.age ?? 25,
          ),
          activityType,
        )
      : null;

  const kcalProgress = dailyKcal ? Math.min((burnedKcal / dailyKcal) * 100, 100) : 0;
  const kcalRemaining = dailyKcal ? Math.max(dailyKcal - burnedKcal, 0) : 0;

  return (
    <div className="flex flex-col gap-4 px-4 pt-5 pb-20 h-full overflow-y-auto bg-bg">
      <h2 className="text-2xl font-extrabold text-primary px-1">오늘의 식단</h2>

      {/* 일일 권장 칼로리 카드 */}
      {dailyKcal ? (
        <div
          className="rounded-2xl px-5 py-5 flex flex-col gap-3"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <span className="text-white font-bold text-sm">일일 권장 칼로리</span>
              <button
                onClick={() => setShowBmrInfo(true)}
                className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center text-white text-[11px] font-extrabold leading-none"
                aria-label="칼로리 계산 방식 보기"
              >
                i
              </button>
            </div>
            {selectedActivityType && (
              <span className="text-[11px] font-bold text-white/80 bg-white/20 rounded-full px-2.5 py-0.5">
                {selectedActivityType.emoji} {selectedActivityType.name}
              </span>
            )}
          </div>
          <div className="flex items-end gap-1">
            <span className="text-white font-extrabold text-4xl">
              {dailyKcal.toLocaleString()}
            </span>
            <span className="text-white/70 font-bold text-sm pb-1">kcal</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-all duration-700"
                style={{ width: `${kcalProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-semibold text-white/80">
              <span>소모 {burnedKcal.toLocaleString()} kcal</span>
              <span>남은 {kcalRemaining.toLocaleString()} kcal</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm p-5 flex items-center gap-3">
          <span className="text-2xl">💡</span>
          <div className="flex-1">
            <p className="font-bold text-gray-700 text-sm">맞춤 칼로리 계산</p>
            <p className="text-xs text-gray-400 mt-0.5">
              내정보 탭에서 신체 정보를 입력하고 활동유형을 선택하면
              개인 맞춤 칼로리를 계산해드려요.
            </p>
          </div>
        </div>
      )}

      {/* 아침 / 점심 / 저녁 추천 메뉴 */}
      {MEAL_CONFIGS.map(({ time, label }) => {
        const menu = getBestMenu(time, activityType);
        if (!menu) return null;
        return (
          <div
            key={time}
            className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-3"
          >
            <div className="flex items-center gap-2">
              <p className="font-extrabold text-gray-800">{label} 추천</p>
              <span className="text-[11px] font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 rounded-full px-2 py-0.5 ml-auto">
                {menu.totalNutrition.kcal} kcal
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{menu.emoji}</span>
              <div>
                <p className="font-bold text-gray-800 text-sm">{menu.name}</p>
                <p className="text-xs text-gray-400">{menu.description}</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {menu.foods.map((food) => (
                <span
                  key={food.name}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold bg-gray-50 border border-gray-100"
                >
                  {food.emoji} {food.name}
                  <span className="text-gray-400 ml-0.5">
                    {food.nutrition.kcal}kcal
                  </span>
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-1 flex-wrap">
                {menu.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-bold text-gray-400 bg-gray-50 rounded-full px-2 py-0.5"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <span className="text-[11px] font-semibold text-gray-400 flex-shrink-0">
                ⏱ {menu.prepTime}분
              </span>
            </div>
          </div>
        );
      })}

      {/* 운동 후 추천 식단 배너 */}
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

      {/* 하단 안내 */}
      <p className="text-[11px] text-gray-400 text-center leading-relaxed pb-2">
        Harris-Benedict 공식과 활동량을 기반으로
        <br />
        개인 맞춤 칼로리를 계산해요 📊
      </p>

      {showBmrInfo && <BmrInfoModal onClose={() => setShowBmrInfo(false)} />}
    </div>
  );
}
