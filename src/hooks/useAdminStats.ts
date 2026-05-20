import { useCallback, useEffect, useState } from "react";
import {
  fetchNewUsersToday,
  fetchSubscriberStats,
  fetchTodayWorkouts,
  fetchTotalUsers,
  fetchTotalWorkouts,
  fetchWorkoutHourlyDistribution,
  type SubscriberStats,
} from "../lib/adminService";

export type { SubscriberStats };

export type AdminStats = {
  totalUsers: number;
  newUsersToday: number;
  activeUsersToday: number;
  workoutSessionsToday: number;
  totalWorkouts: number;
  hourlyDistribution: number[];
};

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [subscriberStats, setSubscriberStats] =
    useState<SubscriberStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const [totalUsers, newUsersToday, todayWorkouts, totalWorkouts, subStats, hourlyDistribution] =
      await Promise.all([
        fetchTotalUsers(),
        fetchNewUsersToday(),
        fetchTodayWorkouts(),
        fetchTotalWorkouts(),
        fetchSubscriberStats(),
        fetchWorkoutHourlyDistribution(),
      ]);
    setStats({
      totalUsers,
      newUsersToday,
      activeUsersToday: todayWorkouts.activeUsers,
      workoutSessionsToday: todayWorkouts.sessions,
      totalWorkouts,
      hourlyDistribution,
    });
    setSubscriberStats(subStats);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { stats, subscriberStats, isLoading, refresh: load };
}
