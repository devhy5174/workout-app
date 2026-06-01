import { useMemo } from "react";
import { useUser } from "../context/UserContext";
import { ACHIEVEMENTS, type Achievement } from "../data/achievements";

export type AchievementProgress = {
  achievement: Achievement;
  current: number;
  isUnlocked: boolean;
  pct: number;
};

export function useAchievements() {
  const { workoutRecords, userProfile } = useUser();

  const progress = useMemo<AchievementProgress[]>(() => {
    const totalSteps = workoutRecords.reduce((s, r) => s + (r.steps ?? 0), 0);
    const totalWorkouts = workoutRecords.length;

    const stepsByDay: Record<string, number> = {};
    workoutRecords.forEach((r) => {
      stepsByDay[r.date] = (stepsByDay[r.date] ?? 0) + (r.steps ?? 0);
    });
    const maxDailySteps =
      Object.values(stepsByDay).length > 0
        ? Math.max(...Object.values(stepsByDay))
        : 0;

    const streak = userProfile?.streak ?? 0;
    const isPremium = (userProfile as any)?.is_premium ?? false;

    const countTimeWorkouts = (startHour: number, endHour: number) =>
      workoutRecords.filter((r) => {
        if (!r.created_at) return false;
        const h = new Date(r.created_at).getHours();
        return endHour === 24 ? h >= startHour : h >= startHour && h < endHour;
      }).length;

    const hasReturnAfterDays = (days: number): boolean => {
      if (workoutRecords.length < 2) return false;
      const sorted = [...workoutRecords].sort((a, b) =>
        a.date.localeCompare(b.date),
      );
      for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(sorted[i - 1].date);
        const curr = new Date(sorted[i].date);
        const gap = (curr.getTime() - prev.getTime()) / 86400000;
        if (gap >= days) return true;
      }
      return false;
    };

    return ACHIEVEMENTS.map((achievement) => {
      const target = achievement.condition.target;
      let current = 0;

      switch (achievement.condition.type) {
        case "first_workout":
          current = Math.min(totalWorkouts, 1);
          break;
        case "total_steps":
          current = totalSteps;
          break;
        case "daily_steps":
          current = maxDailySteps;
          break;
        case "streak_days":
          current = streak;
          break;
        case "time_workout": {
          const { startHour = 0, endHour = 24 } =
            achievement.condition.meta ?? {};
          current = countTimeWorkouts(startHour, endHour);
          break;
        }
        case "return_after_days":
          current = hasReturnAfterDays(target) ? target : 0;
          break;
        case "premium_join":
          current = isPremium ? 1 : 0;
          break;
        // party/post/weather/season/unlock: 로컬 데이터 없음 — 추후 Supabase 연동
        default:
          current = 0;
      }

      const isUnlocked = current >= target;
      const pct = Math.min(100, Math.round((current / target) * 100));
      return { achievement, current, isUnlocked, pct };
    });
  }, [workoutRecords, userProfile]);

  const unlockedCount = progress.filter((p) => p.isUnlocked).length;

  return { progress, unlockedCount, total: ACHIEVEMENTS.length };
}
