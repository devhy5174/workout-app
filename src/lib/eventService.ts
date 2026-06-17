import { supabase } from "./supabase";
import type {
  AppEvent,
  EventCategory,
  EventConditionType,
  EventRewardType,
} from "../data/events";

// ── DB ↔ TS 변환 ──────────────────────────────────────────

type EventRow = {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  category: string;
  condition_type: string;
  condition_value: number;
  reward_type: string;
  bubble_id: string | null;
  title_text: string | null;
  is_active: boolean;
  is_fixed: boolean;
  created_at: string;
};

// 고정 이벤트의 더미 종료일 (사실상 무기한)
const FIXED_END_DATE = "9999-12-31";

function rowToEvent(row: EventRow): AppEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
    category: row.category as EventCategory,
    conditionType: row.condition_type as EventConditionType,
    conditionValue: row.condition_value,
    reward: {
      type: row.reward_type as EventRewardType,
      bubbleId: row.bubble_id ?? undefined,
      titleText: row.title_text ?? undefined,
    },
    isActive: row.is_active,
    isFixed: row.is_fixed ?? false,
    createdAt: row.created_at,
  };
}

function eventToRow(event: Omit<AppEvent, "id" | "createdAt">) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    title: event.title,
    description: event.description,
    start_date: event.isFixed ? today : event.startDate,
    end_date: event.isFixed ? FIXED_END_DATE : event.endDate,
    category: event.category,
    condition_type: event.conditionType,
    condition_value: event.conditionValue,
    reward_type: event.reward.type,
    bubble_id: event.reward.bubbleId ?? null,
    title_text: event.reward.titleText ?? null,
    is_active: event.isActive,
    is_fixed: event.isFixed,
  };
}

// ── 이벤트 CRUD ───────────────────────────────────────────

export async function fetchEvents(): Promise<AppEvent[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as EventRow[]).map(rowToEvent);
}

export async function createEvent(
  event: Omit<AppEvent, "id" | "createdAt">,
): Promise<AppEvent | null> {
  const { data, error } = await supabase
    .from("events")
    .insert(eventToRow(event))
    .select()
    .single();
  if (error || !data) return null;
  return rowToEvent(data as EventRow);
}

export async function updateEventInDB(
  id: string,
  event: Omit<AppEvent, "id" | "createdAt">,
): Promise<boolean> {
  const { error } = await supabase
    .from("events")
    .update(eventToRow(event))
    .eq("id", id);
  return !error;
}

export async function deleteEventFromDB(id: string): Promise<boolean> {
  const { error } = await supabase.from("events").delete().eq("id", id);
  return !error;
}

export async function toggleEventInDB(
  id: string,
  isActive: boolean,
): Promise<boolean> {
  const { error } = await supabase
    .from("events")
    .update({ is_active: isActive })
    .eq("id", id);
  return !error;
}

// ── 달성자 집계 ───────────────────────────────────────────

export type Achiever = {
  userId: string;
  nickname: string;
  /** personal: 걸음수, streak: 연속일수, party: 파티 합산 걸음수 */
  progress: number;
  alreadyGranted: boolean;
  /** party 이벤트에만 있음 */
  partyName?: string;
};

export async function fetchEventAchievers(
  event: AppEvent,
): Promise<Achiever[]> {
  const {
    id: eventId,
    startDate,
    endDate,
    category,
    conditionType,
    conditionValue,
  } = event;

  // 이미 지급된 유저 목록
  const { data: grants } = await supabase
    .from("event_grants")
    .select("user_id")
    .eq("event_id", eventId);
  const grantedSet = new Set(
    (grants ?? []).map((g: any) => g.user_id as string),
  );

  // ── streak: public_profiles.streak 기준 ──────────────
  if (category === "streak") {
    const { data } = await supabase
      .from("public_profiles")
      .select("id, nickname, streak")
      .gte("streak", conditionValue);
    return (data ?? []).map((u: any) => ({
      userId: u.id,
      nickname: u.nickname ?? "익명",
      progress: u.streak ?? 0,
      alreadyGranted: grantedSet.has(u.id),
    }));
  }

  // ── personal: workout_history 기간 내 걸음수 집계 ────
  if (category === "personal") {
    const { data: workouts } = await supabase
      .from("workout_history")
      .select("user_id, steps, date")
      .gte("date", startDate)
      .lte("date", endDate);

    if (!workouts?.length) return [];

    const stepsByUser: Record<string, number> = {};
    const daysByUser: Record<string, Set<string>> = {};

    for (const w of workouts) {
      if (!stepsByUser[w.user_id]) {
        stepsByUser[w.user_id] = 0;
        daysByUser[w.user_id] = new Set();
      }
      stepsByUser[w.user_id] += w.steps ?? 0;
      daysByUser[w.user_id].add(w.date);
    }

    const userIds = Object.keys(stepsByUser);
    const { data: profiles } = await supabase
      .from("public_profiles")
      .select("id, nickname")
      .in("id", userIds);
    const profileMap = new Map(
      (profiles ?? []).map((p: any) => [p.id, (p.nickname ?? "익명") as string]),
    );

    return userIds
      .map((uid) => {
        const totalSteps = stepsByUser[uid];
        const days = Math.max(daysByUser[uid].size, 1);
        const progress =
          conditionType === "avg_steps"
            ? Math.round(totalSteps / days)
            : totalSteps;
        return {
          userId: uid,
          nickname: profileMap.get(uid) ?? "익명",
          progress,
          isAchieved: progress >= conditionValue,
          alreadyGranted: grantedSet.has(uid),
        };
      })
      .filter((a) => a.isAchieved)
      .sort((a, b) => b.progress - a.progress);
  }

  // ── party: 파티원 합산 걸음수 ────────────────────────
  if (category === "party") {
    const [{ data: parties }, { data: members }, { data: workouts }] =
      await Promise.all([
        supabase.from("parties").select("id, name"),
        supabase.from("party_members").select("party_id, user_id"),
        supabase
          .from("workout_history")
          .select("user_id, steps")
          .gte("date", startDate)
          .lte("date", endDate),
      ]);

    if (!parties?.length || !members?.length) return [];

    const stepsByUser: Record<string, number> = {};
    for (const w of workouts ?? []) {
      stepsByUser[w.user_id] =
        (stepsByUser[w.user_id] ?? 0) + (w.steps ?? 0);
    }

    const partyNameMap = new Map(
      (parties ?? []).map((p: any) => [p.id, p.name as string]),
    );
    const partySteps: Record<string, number> = {};
    const partyMemberIds: Record<string, string[]> = {};

    for (const m of members ?? []) {
      partySteps[m.party_id] =
        (partySteps[m.party_id] ?? 0) + (stepsByUser[m.user_id] ?? 0);
      if (!partyMemberIds[m.party_id]) partyMemberIds[m.party_id] = [];
      partyMemberIds[m.party_id].push(m.user_id);
    }

    // avg_steps 이면 이벤트 기간 일수로 나눠 일평균 계산
    const eventDays = Math.max(
      Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1,
      1,
    );
    const partyProgress = (pid: string) =>
      conditionType === "avg_steps"
        ? Math.round(partySteps[pid] / eventDays)
        : partySteps[pid];

    const achievingPartyIds = Object.keys(partySteps).filter(
      (pid) => partyProgress(pid) >= conditionValue,
    );
    if (!achievingPartyIds.length) return [];

    const allMemberIds = [
      ...new Set(achievingPartyIds.flatMap((pid) => partyMemberIds[pid])),
    ];
    const { data: profiles } = await supabase
      .from("public_profiles")
      .select("id, nickname")
      .in("id", allMemberIds);
    const profileMap = new Map(
      (profiles ?? []).map((p: any) => [p.id, (p.nickname ?? "익명") as string]),
    );

    return achievingPartyIds.flatMap((pid) =>
      (partyMemberIds[pid] ?? []).map((uid) => ({
        userId: uid,
        nickname: profileMap.get(uid) ?? "익명",
        progress: partyProgress(pid),
        alreadyGranted: grantedSet.has(uid),
        partyName: partyNameMap.get(pid) ?? "알 수 없는 파티",
      })),
    );
  }

  return [];
}

// ── 보상 지급 ─────────────────────────────────────────────

// ── 유저의 이벤트 보상 목록 조회 ──────────────────────────

export type UserEventGrantInfo = {
  grantedBubbleIds: string[];
  grantedTitles: string[];
};

export async function fetchUserEventGrants(
  userId: string,
): Promise<UserEventGrantInfo> {
  const { data } = await supabase
    .from("event_grants")
    .select("bubble_id, title_text")
    .eq("user_id", userId);

  if (!data) return { grantedBubbleIds: [], grantedTitles: [] };

  return {
    grantedBubbleIds: [
      ...new Set(
        data
          .filter((g: any) => g.bubble_id)
          .map((g: any) => g.bubble_id as string),
      ),
    ],
    grantedTitles: [
      ...new Set(
        data
          .filter((g: any) => g.title_text)
          .map((g: any) => g.title_text as string),
      ),
    ],
  };
}

// 고정 이벤트 자동 지급 (조건 달성 시 유저가 직접 self-grant)
// 새로 지급됐으면 true, 이미 지급된 적 있으면 false 반환
export async function autoGrantFixedEvent(
  eventId: string,
  userId: string,
  reward: { type: string; bubbleId?: string; titleText?: string },
): Promise<boolean> {
  const { data: existing } = await supabase
    .from("event_grants")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!existing) {
    await supabase.from("event_grants").insert({
      event_id: eventId,
      user_id: userId,
      reward_type: reward.type,
      bubble_id: reward.bubbleId ?? null,
      title_text: reward.titleText ?? null,
      granted_by: userId,
    });
    return true;
  }
  return false;
}

export async function grantEventReward(
  eventId: string,
  userId: string,
  reward: { type: string; bubbleId?: string; titleText?: string },
  grantedBy: string,
): Promise<boolean> {
  const { error } = await supabase.from("event_grants").insert({
    event_id: eventId,
    user_id: userId,
    reward_type: reward.type,
    bubble_id: reward.bubbleId ?? null,
    title_text: reward.titleText ?? null,
    granted_by: grantedBy,
  });
  return !error;
}

// 운동 저장 후 활성 이벤트 조건 체크 → 달성 시 자동 지급 (Supabase RPC)
// 신규 지급된 항목 반환 (팝업 표시용)
export async function checkAndGrantEventRewards(
  userId: string,
): Promise<{ bubbleId?: string; titleText?: string }[]> {
  const before = await fetchUserEventGrants(userId);
  await supabase.rpc("check_and_grant_event_rewards", { p_user_id: userId });
  const after = await fetchUserEventGrants(userId);

  const beforeBubbles = new Set(before.grantedBubbleIds);
  const beforeTitles = new Set(before.grantedTitles);

  const newGrants: { bubbleId?: string; titleText?: string }[] = [];
  for (const id of after.grantedBubbleIds) {
    if (!beforeBubbles.has(id)) newGrants.push({ bubbleId: id });
  }
  for (const t of after.grantedTitles) {
    if (!beforeTitles.has(t)) newGrants.push({ titleText: t });
  }
  return newGrants;
}
