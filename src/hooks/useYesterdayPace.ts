// [어제 기록 페이서]
// 워크아웃 트래커 화면에서 "어제 이 시점"과 현재 걸음수를 실시간 비교해주는 훅.
// 어제 총 걸음수 ÷ 총 운동시간 = 초당 페이스 → 현재 경과시간에 곱해 예상 걸음수 계산.
// 어제 기록 없으면 null 반환 (배너 숨김 처리용).

import { useState, useEffect, useMemo } from "react";
import { fetchYesterdayWorkout } from "../lib/workoutService";

export function useYesterdayPace(userId: string | null, elapsed: number, currentSteps: number) {
  const [yesterday, setYesterday] = useState<{ steps: number; duration: number } | null>(null);

  useEffect(() => {
    if (!userId) return;
    fetchYesterdayWorkout(userId).then(setYesterday);
  }, [userId]);

  const result = useMemo(() => {
    if (!yesterday || elapsed === 0) return null;

    const stepsPerSec = yesterday.steps / yesterday.duration;
    const expectedSteps = Math.round(stepsPerSec * elapsed);
    const diff = currentSteps - expectedSteps;

    return { expectedSteps, diff };
  }, [yesterday, elapsed, currentSteps]);

  return result;
}
