import { supabase } from "./supabase";

// ── SQL for Supabase ──────────────────────────────────
// Run in Supabase SQL editor:
//
// create table workout_history (
//   id uuid primary key default gen_random_uuid(),
//   user_id uuid references auth.users not null,
//   date date not null,
//   duration int not null,        -- seconds
//   distance float not null,      -- km
//   steps int not null,
//   calories int not null,
//   points_earned int not null default 0,
//   workout_type text not null,
//   goal_achieved boolean not null default false,
//   created_at timestamptz default now()
// );
// alter table workout_history enable row level security;
// create policy "own records" on workout_history
//   for all using (auth.uid() = user_id);
//
// create table user_goals (
//   id uuid primary key default gen_random_uuid(),
//   user_id uuid references auth.users not null,
//   goal_type text not null,      -- 'calories' | 'steps' | 'distance'
//   goal_value float not null,
//   is_active boolean not null default true,
//   created_at timestamptz default now()
// );
// alter table user_goals enable row level security;
// create policy "own goals" on user_goals
//   for all using (auth.uid() = user_id);

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
  userId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("workout_history")
    .insert({ ...record, user_id: userId });
  return { error: error?.message ?? null };
}

export async function fetchWorkoutHistory(userId: string): Promise<WorkoutRecord[]> {
  const { data, error } = await supabase
    .from("workout_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data as WorkoutRecord[];
}

export async function fetchActiveGoal(userId: string): Promise<UserGoal | null> {
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
  userId: string
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

export async function deleteActiveGoal(userId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("user_goals")
    .update({ is_active: false })
    .eq("user_id", userId)
    .eq("is_active", true);
  return { error: error?.message ?? null };
}
