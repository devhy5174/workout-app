import { useState, useEffect } from "react";
import {
  fetchWeeklyTop3,
  fetchTodayTop3,
  fetchMyRankInPeriod,
  type WeeklyTopUser,
  type MyRankResult,
} from "../lib/workoutService";
import { localDateStr } from "../utils/streak";

export function useWeeklyTop3(userId?: string) {
  const [top3, setTop3] = useState<WeeklyTopUser[]>([]);
  const [todayTop3, setTodayTop3] = useState<WeeklyTopUser[]>([]);
  const [myWeeklyRank, setMyWeeklyRank] = useState<MyRankResult>(null);
  const [myDailyRank, setMyDailyRank] = useState<MyRankResult>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    const weekStart = localDateStr(monday);
    const weekEnd = localDateStr(now);
    const today = localDateStr(now);

    const tasks: Promise<any>[] = [fetchWeeklyTop3(), fetchTodayTop3()];
    if (userId) {
      tasks.push(fetchMyRankInPeriod(userId, weekStart, weekEnd));
      tasks.push(fetchMyRankInPeriod(userId, today, today));
    }

    Promise.all(tasks)
      .then(([weekly, daily, myWeekly, myDaily]) => {
        setTop3(weekly);
        setTodayTop3(daily);
        if (myWeekly !== undefined) setMyWeeklyRank(myWeekly);
        if (myDaily !== undefined) setMyDailyRank(myDaily);
      })
      .finally(() => setIsLoading(false));
  }, [userId]);

  return { top3, todayTop3, myWeeklyRank, myDailyRank, isLoading };
}
