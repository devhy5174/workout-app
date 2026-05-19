import { supabase } from "./supabase";
import { getCharacterById } from "../data/activityTypes";
import { getAvatarCharacterById } from "../data/avatarCharacters";
import { localDateStr } from "../utils/streak";

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
  title: string | null;
  character_emoji: string;
  character_image: string | null;
  weekly_steps: number;
  today_steps: number;
  is_active: boolean;
  joined_at: string;
  last_active_at: string | null;
  /** active_sessions.active_bubble — SQL 마이그레이션 후 DB에서 채워짐 */
  active_bubble_id: string | null;
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

/** 방장 나가기 — 다른 멤버에게 자동 위임 후 탈퇴, 혼자면 파티 해체 */
export async function leavePartyAsLeader(
  partyId: string,
  leaderId: string,
): Promise<{ error: string | null; dissolved: boolean }> {
  // 나 제외한 멤버 확인
  const { data: others } = await supabase
    .from("party_members")
    .select("user_id")
    .eq("party_id", partyId)
    .neq("user_id", leaderId)
    .limit(1);

  // 혼자 남아있으면 파티 해체
  if (!others || others.length === 0) {
    const { error } = await supabase.from("parties").delete().eq("id", partyId);
    return { error: error?.message ?? null, dissolved: true };
  }

  // RPC로 방장 위임 (SECURITY DEFINER라 RLS 우회)
  const { error: rpcError } = await supabase.rpc("transfer_party_leadership", {
    p_party_id: partyId,
  });
  if (rpcError) return { error: rpcError.message, dissolved: false };

  // 파티 탈퇴
  const { error: leaveError } = await supabase
    .from("party_members")
    .delete()
    .eq("party_id", partyId)
    .eq("user_id", leaderId);

  return { error: leaveError?.message ?? null, dissolved: false };
}

export type PartyTodayStats = {
  totalSteps: number;
  avgSteps: number;
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
    return { totalSteps: 0, avgSteps: 0, topMember: null };

  const userIds = members.map((m: any) => m.user_id);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: workouts } = await supabase
    .from("workout_history")
    .select("user_id, steps")
    .in("user_id", userIds)
    .gte("created_at", todayStart.toISOString());

  if (!workouts || workouts.length === 0)
    return { totalSteps: 0, avgSteps: 0, topMember: null };

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

  if (totalSteps === 0) return { totalSteps: 0, avgSteps: 0, topMember: null };

  const avgSteps = Math.round(totalSteps / members.length);

  const topMemberRow = members.find((m: any) => m.user_id === topUserId);
  const topNickname =
    (topMemberRow?.public_profiles as any)?.nickname ?? "알 수 없음";

  return {
    totalSteps,
    avgSteps,
    topMember: { user_id: topUserId, nickname: topNickname, steps: topSteps },
  };
}

export type PartyNotice = {
  id: string;
  party_id: string;
  user_id: string;
  message: string;
  created_at: string;
};

export async function getPartyNotices(partyId: string): Promise<PartyNotice[]> {
  const { data, error } = await supabase
    .from("party_notices")
    .select("*")
    .eq("party_id", partyId)
    .order("created_at", { ascending: false })
    .limit(5);
  if (error || !data) return [];
  return data as PartyNotice[];
}

export async function sendPartyNotice(
  partyId: string,
  userId: string,
  message: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("party_notices")
    .insert({ party_id: partyId, user_id: userId, message });
  return { error: error?.message ?? null };
}

export async function deletePartyNotice(
  noticeId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("party_notices")
    .delete()
    .eq("id", noticeId);
  return { error: error?.message ?? null };
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
      "user_id, party_id, joined_at, public_profiles(nickname, character_id, activity_type_id, title)",
    )
    .eq("party_id", partyId);

  if (error || !members) return [];

  const userIds = members.map((m: any) => m.user_id);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [weeklyResult, todayResult, activeResult, recentActivityResult] =
    await Promise.all([
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
        .select("user_id, active_bubble")
        .in("user_id", userIds)
        .eq("is_active", true),
      supabase
        .from("workout_history")
        .select("user_id, date, created_at")
        .in("user_id", userIds)
        .order("created_at", { ascending: false }),
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

  const activeBubbleMap = new Map<string, string | null>(
    (activeResult.data ?? []).map((s: any) => [s.user_id, s.active_bubble ?? null]),
  );

  const lastActiveMap = new Map<string, string>();

  (recentActivityResult.data ?? []).forEach((w: any) => {
    if (!lastActiveMap.has(w.user_id)) {
      const dateStr =
        typeof w.created_at === "string"
          ? new Date(w.created_at).toISOString().split("T")[0]
          : null;
      if (dateStr) {
        lastActiveMap.set(w.user_id, dateStr);
      }
    }
  });

  const result = members.map((m: any) => {
    const profile = m.public_profiles as any;
    const characterEmoji =
      profile?.activity_type_id != null
        ? (getCharacterById(profile.activity_type_id)?.emoji ?? "🏃")
        : "🏃";
    const characterImage =
      getAvatarCharacterById(profile?.character_id)?.image ?? null;
    const last_active_at = lastActiveMap.get(m.user_id) ?? null;
    return {
      user_id: m.user_id,
      party_id: m.party_id,
      nickname: profile?.nickname ?? "알 수 없음",
      title: profile?.title ?? null,
      character_emoji: characterEmoji,
      character_image: characterImage,
      weekly_steps: weeklyStepsMap.get(m.user_id) ?? 0,
      today_steps: todayStepsMap.get(m.user_id) ?? 0,
      is_active: activeUserIds.has(m.user_id),
      joined_at: m.joined_at,
      last_active_at,
      active_bubble_id: activeUserIds.has(m.user_id) ? (activeBubbleMap.get(m.user_id) ?? null) : null,
    };
  });

  return result;
}

export type PartyHighlight = {
  id: string;
  name: string;
  emoji: string;
  value: number;
};

export async function fetchTodayTopParties(): Promise<PartyHighlight[]> {
  const today = localDateStr(new Date());

  const { data: workouts } = await supabase
    .from("workout_history")
    .select("user_id, steps")
    .eq("date", today);

  if (!workouts || workouts.length === 0) return [];

  const stepsPerUser = new Map<string, number>();
  for (const w of workouts) {
    if (!w.user_id) continue;
    stepsPerUser.set(w.user_id, (stepsPerUser.get(w.user_id) ?? 0) + (w.steps ?? 0));
  }

  const userIds = [...stepsPerUser.keys()];
  const { data: memberships } = await supabase
    .from("party_members")
    .select("user_id, party_id")
    .in("user_id", userIds);

  if (!memberships || memberships.length === 0) return [];

  const stepsPerParty = new Map<string, number>();
  for (const m of memberships) {
    const steps = stepsPerUser.get(m.user_id) ?? 0;
    stepsPerParty.set(m.party_id, (stepsPerParty.get(m.party_id) ?? 0) + steps);
  }

  const top3 = [...stepsPerParty.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const partyIds = top3.map(([id]) => id);
  const { data: parties } = await supabase
    .from("parties")
    .select("id, name")
    .in("id", partyIds);

  const partyMap = new Map((parties ?? []).map((p: any) => [p.id, p]));

  return top3.map(([partyId, steps]) => {
    const party = partyMap.get(partyId) as any;
    return {
      id: partyId,
      name: party?.name ?? "알 수 없음",
      emoji: PARTY_EMOJIS[(party?.name?.length ?? 0) % PARTY_EMOJIS.length],
      value: steps,
    };
  });
}

export async function fetchTrendingParties(): Promise<PartyHighlight[]> {
  const { data: sessions } = await supabase
    .from("active_sessions")
    .select("user_id")
    .eq("is_active", true);

  if (!sessions || sessions.length === 0) return [];

  const userIds = sessions.map((s: any) => s.user_id);
  const { data: memberships } = await supabase
    .from("party_members")
    .select("user_id, party_id")
    .in("user_id", userIds);

  if (!memberships || memberships.length === 0) return [];

  const countPerParty = new Map<string, number>();
  for (const m of memberships) {
    countPerParty.set(m.party_id, (countPerParty.get(m.party_id) ?? 0) + 1);
  }

  const top3 = [...countPerParty.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const partyIds = top3.map(([id]) => id);
  const { data: parties } = await supabase
    .from("parties")
    .select("id, name")
    .in("id", partyIds);

  const partyMap = new Map((parties ?? []).map((p: any) => [p.id, p]));

  return top3.map(([partyId, count]) => {
    const party = partyMap.get(partyId) as any;
    return {
      id: partyId,
      name: party?.name ?? "알 수 없음",
      emoji: PARTY_EMOJIS[(party?.name?.length ?? 0) % PARTY_EMOJIS.length],
      value: count,
    };
  });
}
