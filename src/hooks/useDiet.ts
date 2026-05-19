import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useActivityType } from "../context/ActivityTypeContext";
import { usePremium } from "../context/PremiumContext";
import { useUser } from "../context/UserContext";
import type { ActivityType } from "../data/activityTypes";
import { getCharacterWorkoutDiet } from "../data/characterWorkoutDiet";
import { storage, type RecommendedDiet } from "../utils/storage";
import { calculateBMR } from "../utils/bmr";
import {
  buildScaledMeals,
  getInitialMealMenuIndices,
  getMealMenuCandidates,
  getNextMealMenuIndex,
  mealMenuIndicesToStoredIds,
  getPersonalDailyKcalTarget,
  getWorkoutTargetKcal,
  resolveMealMenuIndices,
  type DietGoal,
  type MainMealTime,
  type MealMenuIndices,
} from "../utils/dietScaling";

const DEFAULT_DIET: RecommendedDiet = {
  durationLabel: "오늘 운동 기록이 없어요",
  durationMeals: [
    { emoji: "🥗", name: "채소 샐러드" },
    { emoji: "🍚", name: "현미밥" },
    { emoji: "🐟", name: "생선구이" },
  ],
  tip: "균형 잡힌 한 끼로 하루를 마무리해요.",
};

function loadMealIndices(
  selectedActivityType: ActivityType | null,
  isPremium: boolean,
): MealMenuIndices {
  const type = selectedActivityType?.type ?? null;
  if (!isPremium) return getInitialMealMenuIndices(type);
  return resolveMealMenuIndices(
    type,
    storage.getPremiumMealMenuIds(),
    true,
  );
}

export function useDiet() {
  const { selectedActivityType } = useActivityType();
  const { userProfile } = useUser();
  const { isPremium, togglePremium } = usePremium();
  const location = useLocation();

  const activityType = selectedActivityType?.type ?? null;

  const [burnedKcal, setBurnedKcal] = useState(0);
  const [showDietInfo, setShowDietInfo] = useState(false);
  const [dietGoal, setDietGoal] = useState<DietGoal>("loss");
  const [mealMenuIndices, setMealMenuIndices] = useState<MealMenuIndices>(() =>
    loadMealIndices(selectedActivityType, isPremium),
  );

  useEffect(() => {
    setBurnedKcal(storage.getBurnedKcal() ?? 0);
  }, [location]);

  useEffect(() => {
    setMealMenuIndices(loadMealIndices(selectedActivityType, isPremium));
  }, [activityType, isPremium]);

  useEffect(() => {
    if (!isPremium) return;
    storage.setPremiumMealMenuIds(mealMenuIndicesToStoredIds(mealMenuIndices));
  }, [mealMenuIndices, isPremium]);

  const savedDiet = storage.getRecommendedDiet();
  const hasWorkout = savedDiet !== null;
  const diet = savedDiet ?? DEFAULT_DIET;

  const charDiet = selectedActivityType
    ? getCharacterWorkoutDiet(selectedActivityType.id)
    : null;

  const hasBodyData = !!(userProfile?.weight && userProfile?.height);

  const bmr = hasBodyData
    ? calculateBMR(
        userProfile!.gender ?? "male",
        userProfile!.weight!,
        userProfile!.height!,
        userProfile!.age ?? 25,
      )
    : null;

  const personalDailyKcalTarget = getPersonalDailyKcalTarget(
    bmr,
    activityType,
  );

  const workoutTargetKcal = getWorkoutTargetKcal(activityType);
  const kcalProgress = Math.min(
    (burnedKcal / workoutTargetKcal) * 100,
    100,
  );
  const kcalRemaining = Math.max(workoutTargetKcal - burnedKcal, 0);

  const scaledMeals = useMemo(
    () => buildScaledMeals(personalDailyKcalTarget, mealMenuIndices, dietGoal),
    [personalDailyKcalTarget, mealMenuIndices, dietGoal],
  );

  const rotateMealMenu = useCallback(
    (mealTime: MainMealTime) => {
      if (!isPremium) return;

      setMealMenuIndices((prev) => {
        const candidateCount = getMealMenuCandidates(mealTime).length;
        if (candidateCount <= 1) return prev;

        return {
          ...prev,
          [mealTime]: getNextMealMenuIndex(prev[mealTime], candidateCount),
        };
      });
    },
    [isPremium],
  );

  return {
    burnedKcal,
    workoutTargetKcal,
    kcalProgress,
    kcalRemaining,
    personalDailyKcalTarget,
    bmr,
    scaledMeals,
    mealMenuIndices,
    hasWorkout,
    diet,
    charDiet,
    selectedActivityType,
    activityType,
    showDietInfo,
    setShowDietInfo,
    dietGoal,
    setDietGoal,
    userProfile,
    isPremium,
    togglePremium,
    rotateMealMenu,
  };
}
