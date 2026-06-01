// src/lib/achievementStatsService.ts
//
// ─── 업적 통계 서비스 ──────────────────────────────────────────────────────────
//
// 역할 분리:
//   buildLocalStats()      → workoutRecords·userProfile 에서 동기적으로 계산 (Supabase 불필요)
//   fetchRemoteStats()     → 파티·인증 데이터를 Supabase에서 조회
//   computeCurrentValue()  → Achievement + AchievementStats → 현재 진행값 (순수함수)
//
// ✅ 새 데이터 소스 추가 시
//   1. AchievementStats 에 필드 추가
//   2. 로컬 계산이면 buildLocalStats(), Supabase면 fetchRemoteStats() 에 쿼리 추가
//   3. computeCurrentValue() switch 에 case 추가
//
// ⏳ 미구현 항목 (current = 0 고정)
//   - party_mvp       : 파티 종료 시 1위 유저를 별도 컬럼/테이블에 저장해야 집계 가능
//   - weather_workout : workout_history 저장 시 weather_code 컬럼 추가 필요
//   - season_workout  : workout_history 저장 시 season 컬럼 추가 필요
//   - unlock_count    : unlockItems.ts 해금 여부를 여기로 연결 필요

import { supabase } from "./supabase";
import type { WorkoutRecord } from "./workoutService";
import type { AppUser } from "../context/UserContext";
import type { Achievement } from "../data/achievements";

// ── 모든 업적 계산에 필요한 통합 통계 타입 ──────────────────
export type AchievementStats = {
  // 운동 (로컬 workoutRecords에서 계산)
  totalWorkouts: number;
  totalSteps: number;
  maxDailySteps: number;
  streak: number;
  morningWorkouts: number;        // 06~08시
  nightWorkouts: number;          // 22~24시
  hasReturnedAfter30Days: boolean;
  isPremium: boolean;
  // 파티 (Supabase)
  partyJoinCount: number;
  partyGoalSuccessCount: number;  // community_posts source_type='party_goal'
  partyMvpCount: number;          // 추후 구현 예정
  // 커뮤니티 (Supabase)
  postCount: number;
  totalCheersReceived: number;
  // 꾸미기 해금 (추후)
  unlockedBubbleCount: number;
};

// ── 로컬 데이터만으로 계산 가능한 통계 (동기, 순수함수) ─────
export function buildLocalStats(
  workoutRecords: WorkoutRecord[],
  userProfile: AppUser | null,
): Omit<
  AchievementStats,
  "partyJoinCount" | "partyGoalSuccessCount" | "partyMvpCount" | "postCount" | "totalCheersReceived" | "unlockedBubbleCount"
> {
  const totalWorkouts = workoutRecords.length;
  const totalSteps = workoutRecords.reduce((s, r) => s + (r.steps ?? 0), 0);

  const stepsByDay: Record<string, number> = {};
  workoutRecords.forEach((r) => {
    stepsByDay[r.date] = (stepsByDay[r.date] ?? 0) + (r.steps ?? 0);
  });
  const maxDailySteps =
    Object.values(stepsByDay).length > 0
      ? Math.max(...Object.values(stepsByDay))
      : 0;

  const countByHour = (startHour: number, endHour: number) =>
    workoutRecords.filter((r) => {
      if (!r.created_at) return false;
      const h = new Date(r.created_at).getHours();
      return h >= startHour && h < endHour;
    }).length;

  const hasReturnedAfter30Days = (() => {
    if (workoutRecords.length < 2) return false;
    const sorted = [...workoutRecords].sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 1; i < sorted.length; i++) {
      const gap =
        (new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime()) /
        86400000;
      if (gap >= 30) return true;
    }
    return false;
  })();

  return {
    totalWorkouts,
    totalSteps,
    maxDailySteps,
    streak: userProfile?.streak ?? 0,
    morningWorkouts: countByHour(6, 8),
    nightWorkouts: countByHour(22, 24),
    hasReturnedAfter30Days,
    isPremium: (userProfile as any)?.is_premium ?? false,
  };
}

// ── Supabase에서 가져와야 하는 통계 ─────────────────────────
export async function fetchRemoteStats(
  userId: string,
): Promise<Pick<AchievementStats, "partyJoinCount" | "partyGoalSuccessCount" | "partyMvpCount" | "postCount" | "totalCheersReceived" | "unlockedBubbleCount">> {
  const [partyRes, goalPostRes, postRes] = await Promise.all([
    // 파티 참가 횟수
    supabase
      .from("party_members")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),

    // 파티 목표 달성 인증글 수 (party_goal 타입 포스트)
    supabase
      .from("community_posts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("source_type", "party_goal"),

    // 전체 인증글 + 받은 응원 수
    supabase
      .from("community_posts")
      .select("cheers")
      .eq("user_id", userId),
  ]);

  const postCount = postRes.data?.length ?? 0;
  const totalCheersReceived = (postRes.data ?? []).reduce(
    (sum, r) => sum + (r.cheers ?? 0),
    0,
  );

  return {
    partyJoinCount: partyRes.count ?? 0,
    partyGoalSuccessCount: goalPostRes.count ?? 0,
    partyMvpCount: 0, // 추후: 파티별 1위 횟수 계산 필요
    postCount,
    totalCheersReceived,
    unlockedBubbleCount: 0, // 추후: unlock 시스템 연동
  };
}

// ── 업적 하나의 현재 진행값을 계산하는 순수함수 ──────────────
// 새 조건 타입 추가 시 여기에 case 하나만 추가하면 됨
export function computeCurrentValue(
  achievement: Achievement,
  stats: AchievementStats,
): number {
  const { type, target, meta } = achievement.condition;

  switch (type) {
    case "first_workout":
      return Math.min(stats.totalWorkouts, 1);
    case "total_steps":
      return stats.totalSteps;
    case "daily_steps":
      return stats.maxDailySteps;
    case "streak_days":
      return stats.streak;
    case "time_workout": {
      const { startHour = 0, endHour = 24 } = meta ?? {};
      // 아침(06~08) or 밤(22~24)
      if (startHour === 6) return stats.morningWorkouts;
      if (startHour === 22) return stats.nightWorkouts;
      return 0;
    }
    case "return_after_days":
      return stats.hasReturnedAfter30Days ? target : 0;
    case "premium_join":
      return stats.isPremium ? 1 : 0;
    case "party_join":
      return stats.partyJoinCount;
    case "party_goal_success":
      return stats.partyGoalSuccessCount;
    case "party_mvp":
      return stats.partyMvpCount;
    case "post_create":
      return stats.postCount;
    case "post_likes":
      return stats.totalCheersReceived;
    case "unlock_count":
      return stats.unlockedBubbleCount;
    case "weather_workout":
    case "season_workout":
      return 0; // 날씨/시즌 기록 저장 구조 미구현
    default:
      return 0;
  }
}
