import { useState, useEffect } from "react";
import {
  fetchWeeklyStats,
  fetchTodayHourlyStats,
  fetchMonthlyStats,
} from "../lib/workoutService";

export type StatPeriod = "day" | "week" | "month";

export type ChartPoint = {
  label: string;
  steps: number;
};

function getPeriodLabel(period: StatPeriod): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();

  if (period === "day") {
    return `${y}년 ${m}월 ${d}일`;
  }
  if (period === "week") {
    const dow = now.getDay();
    const mondayOffset = dow === 0 ? -6 : 1 - dow;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (dt: Date) => `${dt.getMonth() + 1}월 ${dt.getDate()}일`;
    return `${y}년 ${fmt(monday)} ~ ${fmt(sunday)}`;
  }
  const daysInMonth = new Date(y, now.getMonth() + 1, 0).getDate();
  return `${y}년 ${m}월 1일 ~ ${daysInMonth}일`;
}

export function useWorkoutStats(userId: string | null) {
  const [period, setPeriod] = useState<StatPeriod>("week");
  const [data, setData] = useState<ChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [periodLabel, setPeriodLabel] = useState(() => getPeriodLabel("week"));

  useEffect(() => {
    setPeriodLabel(getPeriodLabel(period));
    if (!userId) {
      setData([]);
      return;
    }
    setIsLoading(true);

    const load = async () => {
      try {
        if (period === "day") {
          const buckets = await fetchTodayHourlyStats(userId);
          setData(buckets.map((steps, i) => ({ label: `${i * 2}시`, steps })));
        } else if (period === "week") {
          const weekly = await fetchWeeklyStats(userId);
          const labels = ["월", "화", "수", "목", "금", "토", "일"];
          setData(weekly.map((steps, i) => ({ label: labels[i], steps })));
        } else {
          const monthly = await fetchMonthlyStats(userId);
          setData(monthly.map((steps, i) => ({ label: String(i + 1), steps })));
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [userId, period]);

  const totalSteps = data.reduce((s, d) => s + d.steps, 0);

  return { period, setPeriod, data, isLoading, periodLabel, totalSteps };
}
