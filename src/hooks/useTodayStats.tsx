import { useEffect, useState } from "react";
import {
  fetchTodayStats,
  type DayStats,
} from "../lib/workoutService";

// 기본 초기값
const initialStats: DayStats = {
  steps: 0,
  distance: 0,
  calories: 0,
};

export function useTodayStats(userId: string | null) {
  // 오늘 통계 상태
  const [todayStats, setTodayStats] =
    useState<DayStats>(initialStats);

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false);

  // 오늘 운동 통계 불러오기
  useEffect(() => {
    // 유저 없으면 초기화
    if (!userId) {
      setTodayStats(initialStats);
      return;
    }

    const load = async () => {
      setIsLoading(true);

      try {
        // 오늘 운동 기록 fetch
        const stats = await fetchTodayStats(userId);

        // 상태 저장
        setTodayStats(stats);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [userId]);

  // 외부에서 사용할 값 반환
  return {
    todayStats,
    isLoading,
  };
}