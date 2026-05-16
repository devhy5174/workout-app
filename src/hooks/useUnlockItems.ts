import { useMemo } from "react";
import { unlockItems, type UnlockItem } from "../data/unlockItems";
import type { WorkoutRecord } from "../lib/workoutService";

export type UnlockItemWithStatus = UnlockItem & { unlocked: boolean };

function calcMonthlyAverageSteps(records: WorkoutRecord[]): number {
  if (records.length === 0) return 0;
  const byMonth: Record<string, number> = {};
  for (const r of records) {
    const key = r.date.slice(0, 7); // "YYYY-MM"
    byMonth[key] = (byMonth[key] ?? 0) + r.steps;
  }
  const totals = Object.values(byMonth);
  return Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);
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

  const itemsWithStatus = useMemo<UnlockItemWithStatus[]>(
    () =>
      unlockItems.map((item) => {
        const { condition } = item;
        if (!condition) return { ...item, unlocked: true };
        let unlocked = true;
        if (condition.monthlyAverageStep !== undefined) {
          unlocked = monthlyAverageSteps >= condition.monthlyAverageStep;
        }
        return { ...item, unlocked };
      }),
    [monthlyAverageSteps]
  );

  return { itemsWithStatus, totalSteps, monthlyAverageSteps };
}
