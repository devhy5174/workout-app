import { supabase } from "./supabase";

export type ActiveSession = {
  user_id: string;
  exercise_type: string;
  started_at: string;
  last_seen: string;
  nickname: string;
  character_id: string | null;
  title: string | null;
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
  const { data: sessions, error } = await supabase
    .from("active_sessions")
    .select("user_id, exercise_type, started_at, last_seen")
    .eq("is_active", true)
    .order("last_seen", { ascending: false });

  if (error || !sessions || sessions.length === 0) return [];

  const userIds = sessions.map((s) => s.user_id);

  const { data: profiles } = await supabase
    .from("public_profiles")
    .select("id, nickname, character_id, title")
    .in("id", userIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p])
  );

  return sessions.map((s) => ({
    user_id: s.user_id,
    exercise_type: s.exercise_type,
    started_at: s.started_at,
    last_seen: s.last_seen,
    nickname: profileMap.get(s.user_id)?.nickname ?? "익명",
    character_id: profileMap.get(s.user_id)?.character_id ?? null,
    title: (profileMap.get(s.user_id) as any)?.title ?? null,
  }));
}
