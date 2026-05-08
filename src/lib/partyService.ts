import { supabase } from "./supabase";

export type TimeSlot = "새벽" | "아침" | "저녁" | "주말";

export type Party = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  created_by: string;
  leader_nickname: string;
  max_members: number;
  target_distance: string;
  exercise_time: TimeSlot;
  tags: string[];
  created_at: string;
  member_count: number;
  is_active: boolean;
};

export type PartyMember = {
  user_id: string;
  party_id: string;
  nickname: string;
  weekly_steps: number;
  joined_at: string;
};

export type CreatePartyInput = {
  name: string;
  description: string;
  max_members: number;
  target_distance: string;
  exercise_time: TimeSlot;
  tags: string[];
};

const PARTY_EMOJIS = ["🏃", "⛰️", "🌙", "🧘", "🚴", "🏊", "⚽", "🎯"];

async function withLeaderNicknames(rows: any[]): Promise<Party[]> {
  if (rows.length === 0) return [];
  const leaderIds = [...new Set(rows.map((p) => p.created_by))];
  const { data: leaders } = await supabase
    .from("users")
    .select("id, nickname")
    .in("id", leaderIds);
  const leaderMap = new Map(
    (leaders ?? []).map((u: any) => [u.id, u.nickname]),
  );
  return rows.map((p) => ({
    ...p,
    emoji: PARTY_EMOJIS[p.name.length % PARTY_EMOJIS.length],
    leader_nickname: leaderMap.get(p.created_by) ?? "알 수 없음",
    member_count: p.party_members?.[0]?.count ?? 0,
  }));
}

export async function getParties(): Promise<Party[]> {
  const { data, error } = await supabase
    .from("parties")
    .select("*, party_members(count)")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return withLeaderNicknames(data);
}

export async function getMyParties(userId: string): Promise<Party[]> {
  const { data: memberRows } = await supabase
    .from("party_members")
    .select("party_id")
    .eq("user_id", userId);
  if (!memberRows || memberRows.length === 0) return [];
  const partyIds = memberRows.map((r: any) => r.party_id);
  const { data, error } = await supabase
    .from("parties")
    .select("*, party_members(count)")
    .in("id", partyIds)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return withLeaderNicknames(data);
}

export async function createParty(
  input: CreatePartyInput,
  userId: string,
): Promise<{ data: Party | null; error: string | null }> {
  const { data: party, error } = await supabase
    .from("parties")
    .insert({
      name: input.name,
      description: input.description,
      max_members: input.max_members,
      target_distance: parseFloat(input.target_distance),
      exercise_time: input.exercise_time,
      tags: input.tags,
      created_by: userId,
      is_active: true,
    })
    .select()
    .single();

  if (error || !party)
    return { data: null, error: error?.message ?? "파티 생성 실패" };

  const { error: memberError } = await supabase
    .from("party_members")
    .insert({ party_id: party.id, user_id: userId });

  if (memberError) {
    await supabase.from("parties").delete().eq("id", party.id);
    return { data: null, error: memberError.message };
  }

  const emoji = PARTY_EMOJIS[party.name.length % PARTY_EMOJIS.length];
  return {
    data: { ...party, emoji, leader_nickname: "나", member_count: 1 },
    error: null,
  };
}

export async function joinParty(
  partyId: string,
  userId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("party_members")
    .insert({ party_id: partyId, user_id: userId });
  return { error: error?.message ?? null };
}

export async function leaveParty(
  partyId: string,
  userId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("party_members")
    .delete()
    .eq("party_id", partyId)
    .eq("user_id", userId);
  return { error: error?.message ?? null };
}

export async function kickMember(
  partyId: string,
  targetUserId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("party_members")
    .delete()
    .eq("party_id", partyId)
    .eq("user_id", targetUserId);
  return { error: error?.message ?? null };
}

export async function deleteParty(
  partyId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("parties").delete().eq("id", partyId);
  return { error: error?.message ?? null };
}

export async function getPartyMembers(partyId: string): Promise<PartyMember[]> {
  const { data: members, error } = await supabase
    .from("party_members")
    .select("user_id, party_id, joined_at, users(nickname)")
    .eq("party_id", partyId);

  if (error || !members) return [];

  const userIds = members.map((m: any) => m.user_id);
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const { data: workouts } = await supabase
    .from("workout_history")
    .select("user_id, steps")
    .in("user_id", userIds)
    .gte("created_at", weekStart.toISOString());

  const stepsMap = new Map<string, number>();
  (workouts ?? []).forEach((w: any) => {
    stepsMap.set(w.user_id, (stepsMap.get(w.user_id) ?? 0) + w.steps);
  });

  return members.map((m: any) => ({
    user_id: m.user_id,
    party_id: m.party_id,
    nickname: (m.users as any)?.nickname ?? "알 수 없음",
    weekly_steps: stepsMap.get(m.user_id) ?? 0,
    joined_at: m.joined_at,
  }));
}
