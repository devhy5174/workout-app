import { useCallback, useEffect, useState } from "react";
import {
  fetchNewUsersToday,
  fetchTodayWorkouts,
  fetchTotalUsers,
  fetchTotalWorkouts,
} from "../lib/adminService";

export type AdminStats = {
  totalUsers: number;
  newUsersToday: number;
  activeUsersToday: number;
  workoutSessionsToday: number;
  totalWorkouts: number;
};

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const [totalUsers, newUsersToday, todayWorkouts, totalWorkouts] =
      await Promise.all([
        fetchTotalUsers(),
        fetchNewUsersToday(),
        fetchTodayWorkouts(),
        fetchTotalWorkouts(),
      ]);
    setStats({
      totalUsers,
      newUsersToday,
      activeUsersToday: todayWorkouts.activeUsers,
      workoutSessionsToday: todayWorkouts.sessions,
      totalWorkouts,
    });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { stats, isLoading, refresh: load };
}
