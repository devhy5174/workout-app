import { useState, useEffect } from "react";
import { fetchWeeklyTop3, type WeeklyTopUser } from "../lib/workoutService";

export function useWeeklyTop3() {
  const [top3, setTop3] = useState<WeeklyTopUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWeeklyTop3()
      .then(setTop3)
      .finally(() => setIsLoading(false));
  }, []);

  return { top3, isLoading };
}
