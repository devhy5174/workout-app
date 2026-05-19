import { useNavigate } from "react-router-dom";
import { useDiet } from "../hooks/useDiet";
import WorkoutGoalTracker from "../components/diet/WorkoutGoalTracker";
import DietInfoModal from "../components/diet/DietInfoModal";
import MealRecommendationCard from "../components/diet/MealRecommendationCard";
import MealPremiumActions from "../components/diet/MealPremiumActions";
import type { DietGoal } from "../utils/dietScaling";

const GOAL_TABS: { value: DietGoal; label: string; emoji: string; color: string; activeClass: string }[] = [
  { value: "loss", label: "체중 감량", emoji: "🔵", color: "text-blue-500", activeClass: "bg-blue-500 text-white" },
  { value: "maintain", label: "체중 유지", emoji: "🟢", color: "text-green-500", activeClass: "bg-green-500 text-white" },
  { value: "gain", label: "근육 증량", emoji: "🟠", color: "text-orange-500", activeClass: "bg-orange-500 text-white" },
];

export default function Diet() {
  const navigate = useNavigate();
  const {
    burnedKcal,
    workoutTargetKcal,
    kcalProgress,
    kcalRemaining,
    bmr,
    scaledMeals,
    hasWorkout,
    diet,
    selectedActivityType,
    showDietInfo,
    setShowDietInfo,
    dietGoal,
    setDietGoal,
    userProfile,
    isPremium,
    rotateMealMenu,
    charDiet,
  } = useDiet();

  function handleGoalSelect(goal: DietGoal) {
    if (goal !== "loss" && !isPremium) {
      alert(
        "체중 유지 및 근육 증량 목표 식단은 프리미엄 프로 전용 기능입니다!\n설정에서 프리미엄으로 업그레이드해 보세요.",
      );
      navigate("/settings");
      return;
    }
    setDietGoal(goal);
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-5 pb-20 h-full overflow-y-auto bg-bg">
      <h2 className="text-2xl font-extrabold text-primary px-1">오늘의 식단</h2>

      <WorkoutGoalTracker
        burnedKcal={burnedKcal}
        workoutTargetKcal={workoutTargetKcal}
        kcalProgress={kcalProgress}
        kcalRemaining={kcalRemaining}
        selectedActivityType={selectedActivityType}
        onInfoClick={() => setShowDietInfo(true)}
      />
      <div className="rounded-2xl bg-gradient-to-r from-primary to-secondary p-2 flex items-center gap-3">
        <span className="text-lg">💪</span>
        <p className="text-white font-bold text-sm">
          {hasWorkout
            ? "운동 후 30분 이내 단백질을 섭취하세요!"
            : selectedActivityType
              ? `${selectedActivityType.emoji} 오늘 운동하면 ${selectedActivityType.name} 맞춤 식단을 받아요!`
              : "오늘 운동하고 맞춤 식단을 받아보세요!"}
        </p>
      </div>

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
          {charDiet && selectedActivityType && (
            <div className="border-t border-gray-100 pt-3">
              <p className="text-[11px] text-gray-400 font-semibold mb-1.5">
                {selectedActivityType.emoji} {selectedActivityType.name} 맞춤
                식단
              </p>
              <div className="flex gap-2 flex-wrap mb-2">
                {charDiet.meals.map((m) => (
                  <span
                    key={m.name}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                    }}
                  >
                    {m.emoji} {m.name}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 leading-snug">
                💡 {charDiet.tip}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 px-1">
        <div className="flex-1 h-px bg-gray-200" />
        <p className="text-xs font-bold text-gray-400">오늘의 3끼 추천</p>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-1.5 flex gap-1">
        {GOAL_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleGoalSelect(tab.value)}
            aria-label={`${tab.label} 목표 선택`}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
              dietGoal === tab.value
                ? tab.activeClass + " shadow-sm"
                : "text-gray-400 hover:bg-gray-50"
            }`}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
            {tab.value !== "loss" && !isPremium && (
              <span className="text-[9px] font-extrabold opacity-70">PRO</span>
            )}
          </button>
        ))}
      </div>

      {scaledMeals.map((meal) => (
        <MealRecommendationCard
          key={`${meal.time}-${meal.menu.id}`}
          label={meal.label}
          menu={meal.menu}
          personalizedMealKcal={meal.personalizedMealKcal}
          scaledFoods={meal.scaledFoods}
          headerAction={
            <MealPremiumActions
              mealTime={meal.time}
              isPremium={isPremium}
              canRotate={meal.candidateCount > 1}
              onRotate={rotateMealMenu}
            />
          }
        />
      ))}

      <p className="text-[11px] text-gray-400 text-center leading-relaxed pb-2">
        내 신체 정보 기반으로 TDEE를 계산해 개인 맞춤 섭취 목표를 적용해요 📊
      </p>

      {showDietInfo && (
        <DietInfoModal
          onClose={() => setShowDietInfo(false)}
          bmr={bmr}
          gender={userProfile?.gender ?? null}
          age={userProfile?.age ?? null}
          height={userProfile?.height ?? null}
          weight={userProfile?.weight ?? null}
        />
      )}
    </div>
  );
}
