import {
  DISTANCE_MESSAGES,
  CALORIE_MESSAGES,
  DURATION_MESSAGES,
  STEP_MESSAGES,
} from "../data/premiumReportData";

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
  return findMessage(CALORIE_MESSAGES, totalCalories, style);
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

  const speed = averageSpeed >= 7 ? "S" : "W";

  const caloriePerKm = totalCalories / Math.max(totalDistance, 1);
  const purpose = caloriePerKm > 80 ? "F" : "D";

  const time = morningWorkoutCount >= nightWorkoutCount ? "A" : "N";

  return `${frequency}${speed}${purpose}${time}`;
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
