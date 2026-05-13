import { useState, useEffect } from "react";
import { getPointHistory, type PointHistoryEntry } from "../lib/pointService";

export function usePoints(userId: string | null) {
  const [history, setHistory] = useState<PointHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setHistory([]);
      return;
    }
    setIsLoading(true);
    getPointHistory(userId).then((data) => {
      setHistory(data);
      setIsLoading(false);
    });
  }, [userId]);

  return { history, isLoading };
}
