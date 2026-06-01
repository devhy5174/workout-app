// src/lib/achievementStatsService.ts
//
// ─── 업적 통계 서비스 ──────────────────────────────────────────────────────────
//
// 역할 분리:
//   buildLocalStats()      → workoutRecords·userProfile 에서 동기적으로 계산 (Supabase 불필요)
//   fetchRemoteStats()     → 파티·인증·날씨 데이터를 Supabase에서 조회
//   computeCurrentValue()  → Achievement + AchievementStats → 현재 진행값 (순수함수)
//
// ✅ 새 데이터 소스 추가 시
//   1. AchievementStats 에 필드 추가
//   2. 로컬 계산이면 buildLocalStats(), Supabase면 fetchRemoteStats() 에 쿼리 추가
//   3. computeCurrentValue() switch 에 case 추가

import { supabase } from "./supabase";
import { unlockItems } from "../data/unlockItems";
import type { WorkoutRecord } from "./workoutService";
import type { AppUser } from "../context/UserContext";
import type { Achievement } from "../data/achievements";

// ── 모든 업적 계산에 필요한 통합 통계 타입 ──────────────────
export type AchievementStats = {
  // 운동 (로컬)
  totalWorkouts: number;
  totalSteps: number;
  maxDailySteps: number;
  streak: number;
  morningWorkouts: number;
  nightWorkouts: number;
  hasReturnedAfter30Days: boolean;
  isPremium: boolean;
  // 계절 (로컬 — workoutRecords.date 기준)
  summerWorkouts: number;   // 6~8월
  winterWorkouts: number;   // 12~2월
  // 꾸미기 해금 (로컬 — unlockItems 조건 계산)
  unlockedBubbleCount: number;
  // 파티 MVP (로컬 — userProfile.party_mvp_count, supabase/party_mvp_count.sql 필요)
  partyMvpCount: number;
  // 파티 (Supabase)
  partyJoinCount: number;
  partyGoalSuccessCount: number;
  // 커뮤니티 (Supabase)
  postCount: number;
  totalCheersReceived: number;
  // 날씨 (Supabase — supabase/workout_weather.sql 필요)
  rainWorkouts: number;
  snowWorkouts: number;
};

type LocalStats = Omit<
  AchievementStats,
  "partyJoinCount" | "partyGoalSuccessCount" | "postCount" | "totalCheersReceived" | "rainWorkouts" | "snowWorkouts"
>;

type RemoteStats = Pick<
  AchievementStats,
  "partyJoinCount" | "partyGoalSuccessCount" | "postCount" | "totalCheersReceived" | "rainWorkouts" | "snowWorkouts"
>;

// ── 로컬 데이터만으로 계산 가능한 통계 (동기, 순수함수) ─────
export function buildLocalStats(
  workoutRecords: WorkoutRecord[],
  userProfile: AppUser | null,
): LocalStats {
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

  // 계절별 운동 수 (한국 기준: 여름 6~8월, 겨울 12~2월)
  const summerWorkouts = workoutRecords.filter((r) => {
    const month = new Date(r.date).getMonth() + 1;
    return month >= 6 && month <= 8;
  }).length;

  const winterWorkouts = workoutRecords.filter((r) => {
    const month = new Date(r.date).getMonth() + 1;
    return month === 12 || month <= 2;
  }).length;

  // 해금된 말풍선 수 — unlockItems 조건 로컬 계산
  const streak = userProfile?.streak ?? 0;
  const isPremium = (userProfile as any)?.is_premium ?? false;
  const monthlyAvgSteps = totalWorkouts > 0 ? Math.round(totalSteps / totalWorkouts) : 0;

  const unlockedBubbleCount = unlockItems.filter((item) => {
    if (item.type !== "activeBubble") return false;
    if (item.premium && !isPremium) return false;
    if (!item.condition) return true;
    if (item.condition.monthlyAverageStep !== undefined) {
      return monthlyAvgSteps >= item.condition.monthlyAverageStep;
    }
    if (item.condition.consecutiveDays !== undefined) {
      return streak >= item.condition.consecutiveDays;
    }
    return true;
  }).length;

  return {
    totalWorkouts,
    totalSteps,
    maxDailySteps,
    streak,
    morningWorkouts: countByHour(6, 8),
    nightWorkouts: countByHour(22, 24),
    hasReturnedAfter30Days,
    isPremium,
    summerWorkouts,
    winterWorkouts,
    unlockedBubbleCount,
    partyMvpCount: userProfile?.party_mvp_count ?? 0,
  };
}

// ── Supabase에서 가져와야 하는 통계 ─────────────────────────
export async function fetchRemoteStats(userId: string): Promise<RemoteStats> {
  const [partyRes, goalPostRes, postRes, weatherRes] = await Promise.all([
    // 파티 참가 횟수
    supabase
      .from("party_members")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),

    // 파티 목표 달성 인증글 수
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

    // 날씨별 운동 수 (supabase/workout_weather.sql 마이그레이션 필요)
    supabase
      .from("workout_history")
      .select("weather_condition")
      .eq("user_id", userId)
      .in("weather_condition", ["rainy", "snow"]),
  ]);

  const postCount = postRes.data?.length ?? 0;
  const totalCheersReceived = (postRes.data ?? []).reduce(
    (sum, r) => sum + (r.cheers ?? 0),
    0,
  );
  const rainWorkouts = (weatherRes.data ?? []).filter(
    (r) => r.weather_condition === "rainy",
  ).length;
  const snowWorkouts = (weatherRes.data ?? []).filter(
    (r) => r.weather_condition === "snow",
  ).length;

  return {
    partyJoinCount: partyRes.count ?? 0,
    partyGoalSuccessCount: goalPostRes.count ?? 0,
    postCount,
    totalCheersReceived,
    rainWorkouts,
    snowWorkouts,
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
      const { startHour = 0 } = meta ?? {};
      if (startHour === 6) return stats.morningWorkouts;
      if (startHour === 22) return stats.nightWorkouts;
      return 0;
    }
    case "return_after_days":
      return stats.hasReturnedAfter30Days ? target : 0;
    case "premium_join":
      return stats.isPremium ? 1 : 0;
    case "season_workout": {
      const { season } = meta ?? {};
      if (season === "summer") return stats.summerWorkouts;
      if (season === "winter") return stats.winterWorkouts;
      return 0;
    }
    case "unlock_count": {
      const { unlockType } = meta ?? {};
      if (unlockType === "speechBubble") return stats.unlockedBubbleCount;
      return 0;
    }
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
    case "weather_workout": {
      const { weather } = meta ?? {};
      if (weather === "rain") return stats.rainWorkouts;
      if (weather === "snow") return stats.snowWorkouts;
      return 0;
    }
    default:
      return 0;
  }
}
