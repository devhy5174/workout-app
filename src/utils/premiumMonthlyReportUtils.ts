import {
  DISTANCE_MESSAGES,
  DURATION_MESSAGES,
  STEP_MESSAGES,
} from "../data/premiumReportData";

export type WorkoutMBTI = "ERFM" | "ERFN" | "EWDM" | "WWDN" | "WRFN" | "EWFM";

export type DrillStyle = "mz" | "adult";

function findMessage(
  list: { min: number; max: number; mz: string; adult: string }[],
  value: number,
  style: DrillStyle,
): string {
  const match = list.find((m) => value >= m.min && value < m.max);
  return match ? match[style] : list[list.length - 1][style];
}

export function getDistanceMessage(totalDistance: number, style: DrillStyle) {
  return findMessage(DISTANCE_MESSAGES, totalDistance, style);
}

export function getCaloriesMessage(totalCalories: number, style: DrillStyle) {
  if (style === "mz") {
    const tanghuluCount = Math.floor(totalCalories / 200);
    if (tanghuluCount === 0) return "탕후루 한 입은 태웠어요 🍡";
    return `탕후루 ${tanghuluCount}개 삭제 🍡`;
  }

  const chickenCount = Math.floor(totalCalories / 2200);
  if (chickenCount >= 1) return `치킨 ${chickenCount}마리 삭제 🍗`;

  const snackCount = Math.floor(totalCalories / 200);
  if (snackCount === 0) return "간식 한 입 정도 소모 완료 🍪";
  return `초코파이 ${snackCount}개 삭제 🍫`;
}

export function getStepsMessage(totalSteps: number, style: DrillStyle) {
  return findMessage(STEP_MESSAGES, totalSteps, style);
}

export function getDurationMessage(totalDuration: number, style: DrillStyle) {
  return findMessage(DURATION_MESSAGES, totalDuration, style);
}

export function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes}분`;
  return `${hours}시간 ${minutes}분`;
}

export function calculateAverageSpeed(distance: number, duration: number) {
  if (!duration) return 0;
  return distance / (duration / 3600);
}

export function calculateWorkoutMBTI({
  workoutDays,
  weekendWorkoutCount,
  weekdayWorkoutCount,
  averageSpeed,
  totalDistance,
  totalCalories,
  morningWorkoutCount,
  nightWorkoutCount,
}: {
  workoutDays: number;
  weekendWorkoutCount: number;
  weekdayWorkoutCount: number;
  averageSpeed: number;
  totalDistance: number;
  totalCalories: number;
  morningWorkoutCount: number;
  nightWorkoutCount: number;
}) {
  const frequency =
    workoutDays >= 15 || weekdayWorkoutCount > weekendWorkoutCount ? "E" : "W";

  const speed = averageSpeed >= 7 ? "R" : "W";

  const caloriePerKm = totalCalories / Math.max(totalDistance, 1);
  const purpose = caloriePerKm > 80 ? "F" : "D";

  const time = morningWorkoutCount >= nightWorkoutCount ? "M" : "N";

  return `${frequency}${speed}${purpose}${time}` as WorkoutMBTI;
}

export function generateMonthlyCards(
  {
    totalDistance,
    totalCalories,
    totalSteps,
    totalDuration,
  }: {
    totalDistance: number;
    totalCalories: number;
    totalSteps: number;
    totalDuration: number;
  },
  style: DrillStyle,
) {
  return [
    {
      type: "distance",
      title: "이번 달 이동 거리",
      value: `${totalDistance.toFixed(1)}km`,
      description: getDistanceMessage(totalDistance, style),
      emoji: "🗺️",
    },
    {
      type: "calories",
      title: "이번 달 칼로리",
      value: `${totalCalories.toLocaleString()} kcal`,
      description: getCaloriesMessage(totalCalories, style),
      emoji: "🔥",
    },
    {
      type: "steps",
      title: "이번 달 걸음 수",
      value: `${totalSteps.toLocaleString()}보`,
      description: getStepsMessage(totalSteps, style),
      emoji: "👟",
    },
    {
      type: "duration",
      title: "이번 달 운동 시간",
      value: formatDuration(totalDuration),
      description: getDurationMessage(totalDuration, style),
      emoji: "⏱️",
    },
  ];
}
