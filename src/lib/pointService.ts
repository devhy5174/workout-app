import { supabase } from "./supabase";

export type PointHistoryEntry = {
  id?: string;
  user_id?: string;
  points: number;
  description: string;
  icon: string;
  type?: string | null;
  created_at?: string;
};

export async function addPoints(
  userId: string,
  points: number,
  description: string,
  icon: string,
  type?: string,
): Promise<{ error: string | null }> {
  const { error: insertError } = await supabase
    .from("point_history")
    .insert({ user_id: userId, points, description, icon, type: type ?? null });

  if (insertError) {
    console.error("[point_history] insert 실패:", insertError.message);
    return { error: insertError.message };
  }

  const { data, error: fetchError } = await supabase
    .from("app_users")
    .select("points")
    .eq("id", userId)
    .single();

  if (fetchError) {
    console.error("[app_users] points 조회 실패:", fetchError.message);
    return { error: fetchError.message };
  }

  const current = (data as { points: number | null } | null)?.points ?? 0;
  const { error: updateError } = await supabase
    .from("app_users")
    .update({ points: current + points })
    .eq("id", userId);

  if (updateError) {
    console.error("[app_users] points 업데이트 실패:", updateError.message);
    return { error: updateError.message };
  }

  return { error: null };
}

export async function getPointHistory(userId: string): Promise<PointHistoryEntry[]> {
  const { data, error } = await supabase
    .from("point_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !data) return [];
  return data as PointHistoryEntry[];
}

export async function getTotalPoints(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("app_users")
    .select("points")
    .eq("id", userId)
    .single();

  if (error || !data) return 0;
  return (data as { points: number | null })?.points ?? 0;
}
