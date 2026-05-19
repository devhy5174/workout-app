import type { ActivityTypes } from "../data/activityTypes";
import {
  getMenusByMealTime,
  type MealTime,
  type RecommendedMenu,
} from "../data/diet";
import { calculateDailyKcal } from "./bmr";
import type { PremiumMealMenuIds } from "./storage";

export const WORKOUT_TARGET_KCAL: Record<ActivityTypes, number> = {
  walker: 200,
  power_walker: 300,
  runner: 400,
  hiker: 500,
};

export const DEFAULT_WORKOUT_TARGET_KCAL = 300;

export type MainMealTime = "breakfast" | "lunch" | "dinner";

export type MealMenuIndices = Record<MainMealTime, number>;

export const INITIAL_MEAL_MENU_INDICES: MealMenuIndices = {
  breakfast: 0,
  lunch: 0,
  dinner: 0,
};

export const MEAL_CONFIGS: {
  time: MainMealTime;
  label: string;
  ratio: number;
}[] = [
  { time: "breakfast", label: "아침", ratio: 0.3 },
  { time: "lunch", label: "점심", ratio: 0.4 },
  { time: "dinner", label: "저녁", ratio: 0.3 },
];

export const WORKOUT_TARGET_LABELS: {
  type: ActivityTypes;
  label: string;
  emoji: string;
}[] = [
  { type: "walker", label: "산책러", emoji: "🚶" },
  { type: "power_walker", label: "파워워커", emoji: "🚶‍♂️" },
  { type: "runner", label: "러너", emoji: "🏃" },
  { type: "hiker", label: "등산가", emoji: "🏔️" },
];

export const FALLBACK_DAILY_KCAL_TARGET = 1800;
export const DEFICIT_KCAL = 300;

export type DietGoal = "loss" | "maintain" | "gain";

export const DIET_GOAL_MEAL_OFFSETS: Record<DietGoal, number> = {
  loss: 0,
  maintain: 100,
  gain: 200,
};

export function getWorkoutTargetKcal(type: ActivityTypes | null): number {
  if (!type) return DEFAULT_WORKOUT_TARGET_KCAL;
  return WORKOUT_TARGET_KCAL[type];
}

export function getPersonalDailyKcalTarget(
  bmr: number | null,
  activityType: ActivityTypes | null,
): number {
  if (bmr && activityType) {
    return calculateDailyKcal(bmr, activityType) - DEFICIT_KCAL;
  }
  return FALLBACK_DAILY_KCAL_TARGET;
}

export function getMealMenuCandidates(mealTime: MainMealTime): RecommendedMenu[] {
  return getMenusByMealTime(mealTime);
}

export function getBestMenu(
  mealTime: MealTime,
  activityType: ActivityTypes | null,
): RecommendedMenu | null {
  const menus = getMenusByMealTime(mealTime);
  if (!activityType) return menus[0] ?? null;
  return (
    menus.find((m) => m.forCharacters.includes(activityType)) ??
    menus[0] ??
    null
  );
}

export function getDefaultMenuIndex(
  mealTime: MainMealTime,
  activityType: ActivityTypes | null,
): number {
  const candidates = getMealMenuCandidates(mealTime);
  if (candidates.length === 0) return 0;

  const best = getBestMenu(mealTime, activityType);
  if (!best) return 0;

  const index = candidates.findIndex((menu) => menu.id === best.id);
  return index >= 0 ? index : 0;
}

export function getInitialMealMenuIndices(
  activityType: ActivityTypes | null,
): MealMenuIndices {
  return {
    breakfast: getDefaultMenuIndex("breakfast", activityType),
    lunch: getDefaultMenuIndex("lunch", activityType),
    dinner: getDefaultMenuIndex("dinner", activityType),
  };
}

export function getNextMealMenuIndex(current: number, candidateCount: number): number {
  if (candidateCount <= 0) return 0;
  return (current + 1) % candidateCount;
}

export function getMenuByIndex(
  mealTime: MainMealTime,
  index: number,
): RecommendedMenu | null {
  const candidates = getMealMenuCandidates(mealTime);
  if (candidates.length === 0) return null;
  const safeIndex =
    ((index % candidates.length) + candidates.length) % candidates.length;
  return candidates[safeIndex] ?? null;
}

export function getIndexFromMenuId(
  mealTime: MainMealTime,
  menuId: number,
): number | null {
  const candidates = getMealMenuCandidates(mealTime);
  const index = candidates.findIndex((menu) => menu.id === menuId);
  return index >= 0 ? index : null;
}

/** 프리미엄 localStorage 메뉴 ID → 끼니별 인덱스 (없거나 무효 시 활동 유형 기본 추천) */
export function resolveMealMenuIndices(
  activityType: ActivityTypes | null,
  storedMenuIds: PremiumMealMenuIds | null,
  useStored: boolean,
): MealMenuIndices {
  const defaults = getInitialMealMenuIndices(activityType);
  if (!useStored || !storedMenuIds) return defaults;

  const resolved = { ...defaults };
  (["breakfast", "lunch", "dinner"] as MainMealTime[]).forEach((mealTime) => {
    const menuId = storedMenuIds[mealTime];
    if (menuId == null) return;
    const index = getIndexFromMenuId(mealTime, menuId);
    if (index != null) resolved[mealTime] = index;
  });

  return resolved;
}

/** 끼니별 인덱스 → localStorage 저장용 메뉴 ID */
export function mealMenuIndicesToStoredIds(
  indices: MealMenuIndices,
): PremiumMealMenuIds {
  const ids: PremiumMealMenuIds = {};
  (["breakfast", "lunch", "dinner"] as MainMealTime[]).forEach((mealTime) => {
    const menu = getMenuByIndex(mealTime, indices[mealTime]);
    if (menu) ids[mealTime] = menu.id;
  });
  return ids;
}

export interface ScaledFood {
  name: string;
  emoji: string;
  kcal: number;
}

export interface ScaledMeal {
  time: MainMealTime;
  label: string;
  ratio: number;
  menu: RecommendedMenu;
  menuIndex: number;
  candidateCount: number;
  personalizedMealKcal: number;
  scaleFactor: number;
  scaledFoods: ScaledFood[];
}

export function scaleMeal(
  personalDailyKcalTarget: number,
  ratio: number,
  menu: RecommendedMenu,
  goalMealKcalOffset: number = 0,
): {
  personalizedMealKcal: number;
  scaleFactor: number;
  scaledFoods: ScaledFood[];
} {
  const personalizedMealKcal =
    Math.round(personalDailyKcalTarget * ratio) + goalMealKcalOffset;
  const baseKcal = menu.totalNutrition.kcal;
  const scaleFactor = baseKcal > 0 ? personalizedMealKcal / baseKcal : 1;

  const scaledFoods = menu.foods.map((food) => ({
    name: food.name,
    emoji: food.emoji,
    kcal: Math.round(food.nutrition.kcal * scaleFactor),
  }));

  return { personalizedMealKcal, scaleFactor, scaledFoods };
}

export function buildScaledMeals(
  personalDailyKcalTarget: number,
  mealMenuIndices: MealMenuIndices,
  dietGoal: DietGoal = "loss",
): ScaledMeal[] {
  const goalMealKcalOffset = DIET_GOAL_MEAL_OFFSETS[dietGoal];

  return MEAL_CONFIGS.flatMap(({ time, label, ratio }) => {
    const menu = getMenuByIndex(time, mealMenuIndices[time]);
    if (!menu) return [];

    const { personalizedMealKcal, scaleFactor, scaledFoods } = scaleMeal(
      personalDailyKcalTarget,
      ratio,
      menu,
      goalMealKcalOffset,
    );

    return [
      {
        time,
        label,
        ratio,
        menu,
        menuIndex: mealMenuIndices[time],
        candidateCount: getMealMenuCandidates(time).length,
        personalizedMealKcal,
        scaleFactor,
        scaledFoods,
      },
    ];
  });
}
