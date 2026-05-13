import { supabase } from "./supabase";

export type ActiveSession = {
  user_id: string;
  exercise_type: string;
  started_at: string;
  last_seen: string;
  nickname: string;
  character_id: string | null;
};

export async function startSession(userId: string, exerciseType: string) {
  await supabase.from("active_sessions").delete().eq("user_id", userId);
  const { error } = await supabase.from("active_sessions").insert({
    user_id: userId,
    exercise_type: exerciseType,
    started_at: new Date().toISOString(),
    last_seen: new Date().toISOString(),
    is_active: true,
  });
  if (error) console.error("[session] start 실패:", error.message);
}

export async function updateSession(userId: string) {
  const { error } = await supabase
    .from("active_sessions")
    .update({ last_seen: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) console.error("[session] update 실패:", error.message);
}

export async function endSession(userId: string) {
  const { error } = await supabase
    .from("active_sessions")
    .delete()
    .eq("user_id", userId);
  if (error) console.error("[session] end 실패:", error.message);
}

export async function getActiveSessions(): Promise<ActiveSession[]> {
  const { data, error } = await supabase
    .from("active_sessions")
    .select(`
      user_id,
      exercise_type,
      started_at,
      last_seen,
      public_profiles!inner(nickname, character_id)
    `)
    .eq("is_active", true)
    .order("last_seen", { ascending: false });

  if (error || !data) return [];

  return (data as any[]).map((row) => ({
    user_id: row.user_id,
    exercise_type: row.exercise_type,
    started_at: row.started_at,
    last_seen: row.last_seen,
    nickname: row.public_profiles?.nickname ?? "익명",
    character_id: row.public_profiles?.character_id ?? null,
  }));
}
