import { supabase } from "./supabase";

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
    console.error("[workout_history] insert 실패:", error.code, error.message, error.details);
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
    console.error("[app_users] points 조회 실패:", fetchError.code, fetchError.message);
    return { error: fetchError.message };
  }

  const current = (data as { points: number | null } | null)?.points ?? 0;
  const { error } = await supabase
    .from("app_users")
    .update({ points: current + points })
    .eq("id", userId);

  if (error) {
    console.error("[app_users] points 업데이트 실패:", error.code, error.message);
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
