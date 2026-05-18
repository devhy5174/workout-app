import { useMemo } from "react";
import { unlockItems, type UnlockItem } from "../data/unlockItems";
import type { WorkoutRecord } from "../lib/workoutService";
import { calcConsecutiveStreak } from "../utils/streak";

export type UnlockItemWithStatus = UnlockItem & { unlocked: boolean };

function calcMonthlyAverageSteps(records: WorkoutRecord[]): number {
  if (records.length === 0) return 0;
  const totalSteps = records.reduce((acc, r) => acc + r.steps, 0);
  return Math.round(totalSteps / records.length);
}

export function useUnlockItems(workoutRecords: WorkoutRecord[]) {
  const totalSteps = useMemo(
    () => workoutRecords.reduce((acc, r) => acc + r.steps, 0),
    [workoutRecords]
  );

  const monthlyAverageSteps = useMemo(
    () => calcMonthlyAverageSteps(workoutRecords),
    [workoutRecords]
  );

  const consecutiveStreak = useMemo(
    () => calcConsecutiveStreak(workoutRecords.map((r) => r.date)),
    [workoutRecords]
  );

  const itemsWithStatus = useMemo<UnlockItemWithStatus[]>(
    () =>
      unlockItems.map((item) => {
        const { condition } = item;
        if (!condition) return { ...item, unlocked: true };
        let unlocked = true;
        if (condition.monthlyAverageStep !== undefined) {
          unlocked = monthlyAverageSteps >= condition.monthlyAverageStep;
        }
        if (condition.consecutiveDays !== undefined) {
          unlocked = consecutiveStreak >= condition.consecutiveDays;
        }
        return { ...item, unlocked };
      }),
    [monthlyAverageSteps, consecutiveStreak]
  );

  return { itemsWithStatus, totalSteps, monthlyAverageSteps, consecutiveStreak };
}
