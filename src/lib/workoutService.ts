import { supabase } from "./supabase";
import { localDateStr } from "../utils/streak";

export type WorkoutRecord = {
  id?: string;
  user_id?: string;
  date: string;
  duration: number;
  distance: number;
  steps: number;
  calories: number;
  points_earned: number;
  workout_type: string;
  goal_achieved: boolean;
  created_at?: string;
};

export type UserGoal = {
  id?: string;
  user_id?: string;
  goal_type: "calories" | "steps" | "distance";
  goal_value: number;
  is_active: boolean;
  created_at?: string;
};

export async function saveWorkoutRecord(
  record: Omit<WorkoutRecord, "id" | "user_id" | "created_at">,
  userId: string,
): Promise<{ data: WorkoutRecord | null; error: string | null }> {
  const { data, error } = await supabase
    .from("workout_history")
    .insert({ ...record, user_id: userId })
    .select()
    .single();

  if (error) {
    console.error(
      "[workout_history] insert 실패:",
      error.code,
      error.message,
      error.details,
    );
    return { data: null, error: error.message };
  }

  console.log("[workout_history] 저장 성공:", data);
  return { data: data as WorkoutRecord, error: null };
}

export async function fetchWorkoutHistory(
  userId: string,
): Promise<WorkoutRecord[]> {
  const { data, error } = await supabase
    .from("workout_history")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data as WorkoutRecord[];
}

export async function addUserPoints(
  userId: string,
  points: number,
): Promise<{ error: string | null }> {
  const { data, error: fetchError } = await supabase
    .from("app_users")
    .select("points")
    .eq("id", userId)
    .single();

  if (fetchError) {
    console.error(
      "[app_users] points 조회 실패:",
      fetchError.code,
      fetchError.message,
    );
    return { error: fetchError.message };
  }

  const current = (data as { points: number | null } | null)?.points ?? 0;
  const { error } = await supabase
    .from("app_users")
    .update({ points: current + points })
    .eq("id", userId);

  if (error) {
    console.error(
      "[app_users] points 업데이트 실패:",
      error.code,
      error.message,
    );
    return { error: error.message };
  }

  console.log("[app_users] points 업데이트:", current, "→", current + points);
  return { error: null };
}

export async function fetchActiveGoal(
  userId: string,
): Promise<UserGoal | null> {
  const { data, error } = await supabase
    .from("user_goals")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data as UserGoal;
}

export async function saveUserGoal(
  goal: Pick<UserGoal, "goal_type" | "goal_value">,
  userId: string,
): Promise<{ error: string | null }> {
  await supabase
    .from("user_goals")
    .update({ is_active: false })
    .eq("user_id", userId)
    .eq("is_active", true);

  const { error } = await supabase
    .from("user_goals")
    .insert({ ...goal, user_id: userId, is_active: true });
  return { error: error?.message ?? null };
}

export type DayStats = {
  steps: number;
  distance: number;
  calories: number;
};

export async function fetchTodayStats(userId: string): Promise<DayStats> {
  const today = localDateStr(new Date());
  const { data, error } = await supabase
    .from("workout_history")
    .select("steps, distance, calories")
    .eq("user_id", userId)
    .eq("date", today);

  if (error || !data) return { steps: 0, distance: 0, calories: 0 };

  return data.reduce(
    (acc, r) => ({
      steps: acc.steps + (r.steps ?? 0),
      distance: acc.distance + (r.distance ?? 0),
      calories: acc.calories + (r.calories ?? 0),
    }),
    { steps: 0, distance: 0, calories: 0 },
  );
}

export async function fetchWeeklyStats(userId: string): Promise<number[]> {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=일 1=월 ... 6=토
  // 월요일을 0번 인덱스로 맞추기
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const startDate = localDateStr(monday);
  const endDate = localDateStr(sunday);

  const { data, error } = await supabase
    .from("workout_history")
    .select("date, steps")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate);

  if (error || !data) return Array(7).fill(0);

  // 날짜별 steps 합산
  const stepsByDate: Record<string, number> = {};
  for (const r of data) {
    stepsByDate[r.date] = (stepsByDate[r.date] ?? 0) + (r.steps ?? 0);
  }

  // 월(0)~일(6) 순서로 배열 반환
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return stepsByDate[localDateStr(d)] ?? 0;
  });
}

export async function fetchRangeStats(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("workout_history")
    .select("steps")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate);

  if (error || !data) return 0;

  return data.reduce((acc, r) => acc + (r.steps ?? 0), 0);
}

export async function deleteWorkoutRecord(
  id: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("workout_history")
    .delete()
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function deleteActiveGoal(
  userId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("user_goals")
    .update({ is_active: false })
    .eq("user_id", userId)
    .eq("is_active", true);
  return { error: error?.message ?? null };
}

// 오늘 2시간 단위 걸음수 버킷 (인덱스 0=00~01시, 1=02~03시, ..., 11=22~23시)
export async function fetchTodayHourlyStats(userId: string): Promise<number[]> {
  const today = localDateStr(new Date());
  const { data, error } = await supabase
    .from("workout_history")
    .select("steps, created_at")
    .eq("user_id", userId)
    .eq("date", today);

  if (error || !data) return Array(12).fill(0);

  const buckets = Array(12).fill(0);
  for (const r of data) {
    const hour = new Date(r.created_at).getHours();
    const bucket = Math.floor(hour / 2);
    buckets[bucket] += r.steps ?? 0;
  }
  return buckets;
}

export type WeeklyTopUser = {
  rank: number;
  nickname: string;
  steps: number;
  character_id: string | null;
};

export async function fetchWeeklyTop3(): Promise<WeeklyTopUser[]> {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const startDate = localDateStr(monday);
  const endDate = localDateStr(sunday);

  const { data: workouts, error } = await supabase
    .from("workout_history")
    .select("user_id, steps")
    .gte("date", startDate)
    .lte("date", endDate);

  if (error || !workouts || workouts.length === 0) return [];

  const stepsByUser: Record<string, number> = {};
  for (const w of workouts) {
    if (!w.user_id) continue;
    stepsByUser[w.user_id] = (stepsByUser[w.user_id] ?? 0) + (w.steps ?? 0);
  }

  const top3Entries = Object.entries(stepsByUser)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  if (top3Entries.length === 0) return [];

  const userIds = top3Entries.map(([id]) => id);
  const { data: profiles } = await supabase
    .from("public_profiles")
    .select("id, nickname, character_id")
    .in("id", userIds);

  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);

  return top3Entries.map(([userId, steps], i) => {
    const profile = profileMap.get(userId);
    return {
      rank: i + 1,
      nickname: profile?.nickname ?? "익명",
      steps,
      character_id: profile?.character_id ?? null,
    };
  });
}

// 이번 달 일별 걸음수 (인덱스 0=1일, 1=2일, ...)
export async function fetchMonthlyStats(userId: string): Promise<number[]> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = localDateStr(new Date(year, month, 1));
  const lastDay = localDateStr(new Date(year, month + 1, 0));
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const { data, error } = await supabase
    .from("workout_history")
    .select("date, steps")
    .eq("user_id", userId)
    .gte("date", firstDay)
    .lte("date", lastDay);

  if (error || !data) return Array(daysInMonth).fill(0);

  const stepsByDay: Record<number, number> = {};
  for (const r of data) {
    const day = parseInt(r.date.split("-")[2]);
    stepsByDay[day] = (stepsByDay[day] ?? 0) + (r.steps ?? 0);
  }

  return Array.from({ length: daysInMonth }, (_, i) => stepsByDay[i + 1] ?? 0);
}
