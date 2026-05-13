import type { ActivityTypes } from "../data/activityTypes";

export const ACTIVITY_MULTIPLIER: Record<ActivityTypes, number> = {
  walker: 1.375,
  power_walker: 1.55,
  runner: 1.725,
  hiker: 1.55,
};

export function calculateBMR(
  gender: string,
  weight: number,
  height: number,
  age: number,
): number {
  if (gender === "female") {
    return 447.6 + 9.2 * weight + 3.1 * height - 4.3 * age;
  }
  return 88.4 + 13.4 * weight + 4.8 * height - 5.7 * age;
}

export function calculateDailyKcal(bmr: number, activityType: ActivityTypes): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIER[activityType]);
}
