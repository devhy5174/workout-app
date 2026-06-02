// src/hooks/useAchievements.ts
//
// ─── 업적 오케스트레이터 훅 ──────────────────────────────────────────────────
//
// 이 훅은 "조합"만 담당합니다. 실제 계산·쿼리 로직은 건드릴 필요 없습니다.
//   - 로컬 통계 (workoutRecords·userProfile) → buildLocalStats()
//   - 원격 통계 (Supabase)                  → fetchRemoteStats()
//   - 진행값 계산                            → computeCurrentValue()
//
// ✅ 원격 통계 추가 시
//   fetchRemoteStats() 에 쿼리 추가 → 자동으로 여기 progress에 반영됨

import { useState, useEffect, useMemo, useRef } from "react";
import { useUser } from "../context/UserContext";
import { ACHIEVEMENTS, type Achievement } from "../data/achievements";
import {
  buildLocalStats,
  fetchRemoteStats,
  computeCurrentValue,
  type AchievementStats,
} from "../lib/achievementStatsService";

export type AchievementProgress = {
  achievement: Achievement;
  current: number;
  isUnlocked: boolean;
  pct: number;
};

const REMOTE_STATS_DEFAULTS: Pick<
  AchievementStats,
  | "partyJoinCount"
  | "partyGoalSuccessCount"
  | "postCount"
  | "totalCheersReceived"
  | "rainWorkouts"
  | "snowWorkouts"
> = {
  partyJoinCount: 0,
  partyGoalSuccessCount: 0,
  postCount: 0,
  totalCheersReceived: 0,
  rainWorkouts: 0,
  snowWorkouts: 0,
};

export function useAchievements() {
  const { workoutRecords, userProfile } = useUser();
  const userId = userProfile?.id;

  const [remoteStats, setRemoteStats] = useState(REMOTE_STATS_DEFAULTS);
  const [isLoading, setIsLoading] = useState(true);

  // 파티/인증 원격 통계 1회 fetch
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    fetchRemoteStats(userId)
      .then(setRemoteStats)
      .finally(() => setIsLoading(false));
  }, [userId]);

  const progress = useMemo<AchievementProgress[]>(() => {
    const localStats = buildLocalStats(workoutRecords, userProfile);
    const stats: AchievementStats = { ...localStats, ...remoteStats };

    return ACHIEVEMENTS.map((achievement) => {
      const target = achievement.condition.target;
      const current = computeCurrentValue(achievement, stats);
      const isUnlocked = current >= target;
      const pct = Math.min(100, Math.round((current / target) * 100));
      return { achievement, current, isUnlocked, pct };
    });
  }, [workoutRecords, userProfile, remoteStats]);

  const unlockedCount = progress.filter((p) => p.isUnlocked).length;

  // 새로 달성된 배지 감지 — localStorage로 이전 달성 목록과 비교
  const seenKey = `achievements_seen_${userId ?? "guest"}`;
  const initDone = useRef(false);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);

  useEffect(() => {
    if (isLoading) return;
    const currentIds = progress.filter((p) => p.isUnlocked).map((p) => p.achievement.id);
    const seen: string[] = JSON.parse(localStorage.getItem(seenKey) ?? "[]");

    if (!initDone.current) {
      // 첫 로드: 현재 달성 목록을 기준으로 초기화 (팝업 없음)
      initDone.current = true;
      if (seen.length === 0 && currentIds.length > 0) {
        localStorage.setItem(seenKey, JSON.stringify(currentIds));
      }
      return;
    }

    const fresh = progress.filter(
      (p) => p.isUnlocked && !seen.includes(p.achievement.id)
    );
    if (fresh.length > 0) {
      setNewlyUnlocked(fresh.map((p) => p.achievement));
      localStorage.setItem(seenKey, JSON.stringify(currentIds));
    }
  }, [isLoading, progress]);

  // 첫 번째 배지만 제거 — 여러 개면 다음 배지가 자동으로 팝업
  const dismissNewlyUnlocked = () => setNewlyUnlocked((prev) => prev.slice(1));

  return {
    progress,
    unlockedCount,
    total: ACHIEVEMENTS.length,
    isLoading,
    newlyUnlocked,
    dismissNewlyUnlocked,
  };
}
