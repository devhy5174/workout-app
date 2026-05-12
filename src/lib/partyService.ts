import { supabase } from "./supabase";
import { getCharacterById } from "../data/activityTypes";
import { getAvatarCharacterById } from "../data/avatarCharacters";

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
  character_emoji: string;
  character_image: string | null;
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
    .from("public_profiles")
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

async function deletePartyIfEmpty(partyId: string): Promise<void> {
  const { count } = await supabase
    .from("party_members")
    .select("*", { count: "exact", head: true })
    .eq("party_id", partyId);
  if (count === 0) {
    await supabase.from("parties").delete().eq("id", partyId);
  }
}

export async function getPartyById(partyId: string): Promise<Party | null> {
  const { data, error } = await supabase
    .from("parties")
    .select("*, party_members(count)")
    .eq("id", partyId)
    .single();
  if (error || !data) return null;
  const [result] = await withLeaderNicknames([data]);
  return result ?? null;
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
  if (error) return { error: error.message };
  await deletePartyIfEmpty(partyId);
  return { error: null };
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
  if (error) return { error: error.message };
  await deletePartyIfEmpty(partyId);
  return { error: null };
}

export async function deleteParty(
  partyId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("parties").delete().eq("id", partyId);
  return { error: error?.message ?? null };
}

export type PartyTodayStats = {
  totalSteps: number;
  topMember: { nickname: string; steps: number } | null;
};

export async function getPartyTodayStats(
  partyId: string,
): Promise<PartyTodayStats> {
  const { data: members } = await supabase
    .from("party_members")
    .select("user_id, public_profiles(nickname)")
    .eq("party_id", partyId);

  if (!members || members.length === 0)
    return { totalSteps: 0, topMember: null };

  const userIds = members.map((m: any) => m.user_id);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: workouts } = await supabase
    .from("workout_history")
    .select("user_id, steps")
    .in("user_id", userIds)
    .gte("created_at", todayStart.toISOString());

  if (!workouts || workouts.length === 0)
    return { totalSteps: 0, topMember: null };

  const stepsMap = new Map<string, number>();
  workouts.forEach((w: any) => {
    stepsMap.set(w.user_id, (stepsMap.get(w.user_id) ?? 0) + w.steps);
  });

  let totalSteps = 0;
  let topUserId = "";
  let topSteps = 0;

  stepsMap.forEach((steps, userId) => {
    totalSteps += steps;
    if (steps > topSteps) {
      topSteps = steps;
      topUserId = userId;
    }
  });

  if (totalSteps === 0) return { totalSteps: 0, topMember: null };

  const topMemberRow = members.find((m: any) => m.user_id === topUserId);
  const topNickname =
    (topMemberRow?.public_profiles as any)?.nickname ?? "알 수 없음";

  return { totalSteps, topMember: { nickname: topNickname, steps: topSteps } };
}

export async function getPartyMembers(partyId: string): Promise<PartyMember[]> {
  const { data: members, error } = await supabase
    .from("party_members")
    .select("user_id, party_id, joined_at, public_profiles(nickname, character_id, activity_type_id)")
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

  return members.map((m: any) => {
    const profile = m.public_profiles as any;
    const characterEmoji =
      profile?.activity_type_id != null
        ? (getCharacterById(profile.activity_type_id)?.emoji ?? "🏃")
        : "🏃";
    const characterImage = getAvatarCharacterById(profile?.character_id)?.image ?? null;
    return {
      user_id: m.user_id,
      party_id: m.party_id,
      nickname: profile?.nickname ?? "알 수 없음",
      character_emoji: characterEmoji,
      character_image: characterImage,
      weekly_steps: stepsMap.get(m.user_id) ?? 0,
      joined_at: m.joined_at,
    };
  });
}
