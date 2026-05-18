import { supabase } from "./supabase";

export type AdminStats = {
  totalUsers: number;
  newUsersToday: number;
  activeUsersToday: number;
  workoutSessionsToday: number;
  totalWorkoutSessions: number;
};

// public_profiles는 RLS UNRESTRICTED — 전체 유저 수 조회 가능
export async function fetchTotalUsers(): Promise<number> {
  const { count, error } = await supabase
    .from("public_profiles")
    .select("*", { count: "exact", head: true });
  if (error) return 0;
  return count ?? 0;
}

// app_users.created_at 기반 오늘 신규 유저 (본인 데이터 + RLS 제한)
export async function fetchNewUsersToday(): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const { count, error } = await supabase
    .from("app_users")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today + "T00:00:00.000Z")
    .lte("created_at", today + "T23:59:59.999Z");
  if (error) return 0;
  return count ?? 0;
}

// 오늘 운동 기록 수 (본인 기록만 집계 가능)
export async function fetchTodayWorkouts(): Promise<{
  sessions: number;
  activeUsers: number;
}> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("workout_history")
    .select("user_id")
    .eq("date", today);
  if (error || !data) return { sessions: 0, activeUsers: 0 };
  const uniqueUsers = new Set(data.map((r) => r.user_id)).size;
  return { sessions: data.length, activeUsers: uniqueUsers };
}

export async function fetchTotalWorkouts(): Promise<number> {
  const { count, error } = await supabase
    .from("workout_history")
    .select("*", { count: "exact", head: true });
  if (error) return 0;
  return count ?? 0;
}
