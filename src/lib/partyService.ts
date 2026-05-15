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
  target_steps: number;
  exercise_time: TimeSlot;
  tags: string[];
  created_at: string;
  member_count: number;
  is_active: boolean;
  active_count: number;
};

export type PartyMember = {
  user_id: string;
  party_id: string;
  nickname: string;
  character_emoji: string;
  character_image: string | null;
  weekly_steps: number;
  today_steps: number;
  is_active: boolean;
  joined_at: string;
};

export type CreatePartyInput = {
  name: string;
  description: string;
  max_members: number;
  target_steps: number;
  exercise_time: TimeSlot;
  tags: string[];
};

const PARTY_EMOJIS = ["👣", "🏃", "⚡", "⛰️", "🌙", "🔥", "🎯"];

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

export async function getPartyActiveCount(partyId: string): Promise<number> {
  const { data: members } = await supabase
    .from("party_members")
    .select("user_id")
    .eq("party_id", partyId);

  if (!members || members.length === 0) return 0;

  const userIds = members.map((m: any) => m.user_id);
  const { count } = await supabase
    .from("active_sessions")
    .select("*", { count: "exact", head: true })
    .in("user_id", userIds)
    .eq("is_active", true);

  return count ?? 0;
}

async function withActiveCounts(parties: Party[]): Promise<Party[]> {
  if (parties.length === 0) return parties;
  const partyIds = parties.map((p) => p.id);

  const { data: members } = await supabase
    .from("party_members")
    .select("party_id, user_id")
    .in("party_id", partyIds);

  if (!members || members.length === 0)
    return parties.map((p) => ({ ...p, active_count: 0 }));

  const allUserIds = [...new Set(members.map((m: any) => m.user_id))];

  const { data: activeSessions } = await supabase
    .from("active_sessions")
    .select("user_id")
    .in("user_id", allUserIds)
    .eq("is_active", true);

  const activeUserIds = new Set(
    (activeSessions ?? []).map((s: any) => s.user_id),
  );

  const countMap = new Map<string, number>();
  members.forEach((m: any) => {
    if (activeUserIds.has(m.user_id)) {
      countMap.set(m.party_id, (countMap.get(m.party_id) ?? 0) + 1);
    }
  });

  return parties.map((p) => ({ ...p, active_count: countMap.get(p.id) ?? 0 }));
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
  const withNicknames = await withLeaderNicknames(data);
  return withActiveCounts(withNicknames);
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
  const withNicknames = await withLeaderNicknames(data);
  return withActiveCounts(withNicknames);
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
      target_steps: input.target_steps,
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
    data: {
      ...party,
      emoji,
      leader_nickname: "나",
      member_count: 1,
      active_count: 0,
    },
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
  const { error } = await supabase.rpc("kick_party_member", {
    p_party_id: partyId,
    p_target_user_id: targetUserId,
  });
  if (error) return { error: error.message };
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
  topMember: { user_id: string; nickname: string; steps: number } | null;
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

  return {
    totalSteps,
    topMember: { user_id: topUserId, nickname: topNickname, steps: topSteps },
  };
}

export type AchievedParty = {
  id: string;
  name: string;
  emoji: string;
};

export async function getAchievedPartiesForUser(
  userId: string,
): Promise<AchievedParty[]> {
  const { data: memberRows } = await supabase
    .from("party_members")
    .select("party_id")
    .eq("user_id", userId);

  if (!memberRows || memberRows.length === 0) return [];

  const partyIds = memberRows.map((r: any) => r.party_id);
  const { data: parties } = await supabase
    .from("parties")
    .select("id, name, target_steps, max_members")
    .in("id", partyIds);

  if (!parties || parties.length === 0) return [];

  // 달성 후 24시간 동안만 배너 표시
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const achieved: AchievedParty[] = [];

  for (const party of parties) {
    const targetTotal = (party.target_steps ?? 0) * party.max_members;
    if (targetTotal <= 0) continue;

    const { data: members } = await supabase
      .from("party_members")
      .select("user_id")
      .eq("party_id", party.id);

    if (!members || members.length === 0) continue;

    const memberUserIds = members.map((m: any) => m.user_id);
    const { data: workouts } = await supabase
      .from("workout_history")
      .select("steps")
      .in("user_id", memberUserIds)
      .gte("created_at", since24h.toISOString());

    const totalSteps = (workouts ?? []).reduce(
      (sum: number, w: any) => sum + w.steps,
      0,
    );

    if (totalSteps >= targetTotal) {
      achieved.push({
        id: party.id,
        name: party.name,
        emoji: PARTY_EMOJIS[party.name.length % PARTY_EMOJIS.length],
      });
    }
  }

  return achieved;
}

export type PartyCheer = {
  id: string;
  party_id: string;
  user_id: string;
  nickname: string;
  message: string;
  created_at: string;
};

export async function getPartyCheers(partyId: string): Promise<PartyCheer[]> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("party_cheers")
    .select("*")
    .eq("party_id", partyId)
    .gte("created_at", todayStart.toISOString())
    .order("created_at", { ascending: true })
    .limit(20);

  if (error || !data) return [];
  return data as PartyCheer[];
}

export async function sendPartyCheer(
  partyId: string,
  userId: string,
  nickname: string,
  message: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("party_cheers")
    .insert({ party_id: partyId, user_id: userId, nickname, message });
  return { error: error?.message ?? null };
}

export async function getPartyMembers(partyId: string): Promise<PartyMember[]> {
  const { data: members, error } = await supabase
    .from("party_members")
    .select(
      "user_id, party_id, joined_at, public_profiles(nickname, character_id, activity_type_id)",
    )
    .eq("party_id", partyId);

  if (error || !members) return [];

  const userIds = members.map((m: any) => m.user_id);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [weeklyResult, todayResult, activeResult] = await Promise.all([
    supabase
      .from("workout_history")
      .select("user_id, steps")
      .in("user_id", userIds)
      .gte("created_at", weekStart.toISOString()),
    supabase
      .from("workout_history")
      .select("user_id, steps")
      .in("user_id", userIds)
      .gte("created_at", todayStart.toISOString()),
    supabase
      .from("active_sessions")
      .select("user_id")
      .in("user_id", userIds)
      .eq("is_active", true),
  ]);

  const weeklyStepsMap = new Map<string, number>();
  (weeklyResult.data ?? []).forEach((w: any) => {
    weeklyStepsMap.set(
      w.user_id,
      (weeklyStepsMap.get(w.user_id) ?? 0) + w.steps,
    );
  });

  const todayStepsMap = new Map<string, number>();
  (todayResult.data ?? []).forEach((w: any) => {
    todayStepsMap.set(w.user_id, (todayStepsMap.get(w.user_id) ?? 0) + w.steps);
  });

  const activeUserIds = new Set(
    (activeResult.data ?? []).map((s: any) => s.user_id),
  );

  return members.map((m: any) => {
    const profile = m.public_profiles as any;
    const characterEmoji =
      profile?.activity_type_id != null
        ? (getCharacterById(profile.activity_type_id)?.emoji ?? "🏃")
        : "🏃";
    const characterImage =
      getAvatarCharacterById(profile?.character_id)?.image ?? null;
    return {
      user_id: m.user_id,
      party_id: m.party_id,
      nickname: profile?.nickname ?? "알 수 없음",
      character_emoji: characterEmoji,
      character_image: characterImage,
      weekly_steps: weeklyStepsMap.get(m.user_id) ?? 0,
      today_steps: todayStepsMap.get(m.user_id) ?? 0,
      is_active: activeUserIds.has(m.user_id),
      joined_at: m.joined_at,
    };
  });
}
