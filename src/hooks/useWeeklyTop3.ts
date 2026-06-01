import { useState, useEffect } from "react";
import {
  fetchWeeklyTop3,
  fetchTodayTop3,
  fetchMyRankInPeriod,
  type WeeklyTopUser,
  type MyRankResult,
} from "../lib/workoutService";
import { localDateStr } from "../utils/streak";
import { getFakeTop3Candidates } from "../data/fakeUsers";

/** 실유저 top3가 3명 미만이면 페이크 유저로 채워 반환. 걸음수 기준 재정렬·재순위 */
function fillWithFake(
  real: WeeklyTopUser[],
  period: "weekly" | "daily",
): WeeklyTopUser[] {
  if (real.length >= 3) return real;
  const realIds = new Set(real.map((u) => u.user_id));
  const fakes = getFakeTop3Candidates(period).filter(
    (u) => !realIds.has(u.user_id),
  );
  const needed = 3 - real.length;
  const merged = [...real, ...fakes.slice(0, needed)];
  return merged
    .sort((a, b) => b.steps - a.steps)
    .map((u, i) => ({ ...u, rank: i + 1 }));
}

/** myRank에 본인보다 걸음수 많은 페이크 수만큼 순위 보정 */
function adjustRank(
  myRank: MyRankResult,
  fakeList: Array<{ steps: number }>,
): MyRankResult {
  if (!myRank) return null;
  const fakeAbove = fakeList.filter((f) => f.steps > myRank!.steps).length;
  return {
    ...myRank,
    rank: myRank.rank + fakeAbove,
    total: myRank.total + fakeList.length,
  };
}

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

    Promise.all(tasks).then(([weekly, daily, myWeekly, myDaily]) => {
      const weeklyFakes = getFakeTop3Candidates("weekly");
      const dailyFakes = getFakeTop3Candidates("daily");

      const filledWeekly = fillWithFake(weekly, "weekly");
      const filledDaily = fillWithFake(daily, "daily");

      setTop3(filledWeekly);
      setTodayTop3(filledDaily);

      if (myWeekly !== undefined)
        setMyWeeklyRank(adjustRank(myWeekly, weeklyFakes));
      if (myDaily !== undefined)
        setMyDailyRank(adjustRank(myDaily, dailyFakes));
    }).finally(() => setIsLoading(false));
  }, [userId]);

  return { top3, todayTop3, myWeeklyRank, myDailyRank, isLoading };
}
