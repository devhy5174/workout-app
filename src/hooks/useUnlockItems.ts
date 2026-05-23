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

export function useUnlockItems(
  workoutRecords: WorkoutRecord[],
  grantedBubbleIds: string[] = [],
) {
  const totalSteps = useMemo(
    () => workoutRecords.reduce((acc, r) => acc + r.steps, 0),
    [workoutRecords]
  );

  const monthlyAverageSteps = useMemo(
    () => calcMonthlyAverageSteps(workoutRecords),
    [workoutRecords]
  );

  const consecutiveStreak = useMemo(() => {
    const stepsByDate: Record<string, number> = {};
    for (const r of workoutRecords) {
      stepsByDate[r.date] = (stepsByDate[r.date] ?? 0) + r.steps;
    }
    const qualifiedDates = Object.entries(stepsByDate)
      .filter(([, steps]) => steps >= 1000)
      .map(([date]) => date);
    return calcConsecutiveStreak(qualifiedDates);
  }, [workoutRecords]);

  const grantedSet = useMemo(
    () => new Set(grantedBubbleIds),
    [grantedBubbleIds],
  );

  const itemsWithStatus = useMemo<UnlockItemWithStatus[]>(
    () =>
      unlockItems.map((item) => {
        // 이벤트 보상으로 지급된 아이템은 조건 무관 해금
        if (grantedSet.has(item.id)) return { ...item, unlocked: true };

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
    [monthlyAverageSteps, consecutiveStreak, grantedSet]
  );

  return { itemsWithStatus, totalSteps, monthlyAverageSteps, consecutiveStreak };
}
