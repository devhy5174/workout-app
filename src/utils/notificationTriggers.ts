import { createNotification } from "../lib/notificationService";
import { supabase } from "../lib/supabase";

export async function notifyPartyJoined(params: {
  leaderUserId: string;
  joinerNickname: string;
  partyName: string;
  partyId: string;
}): Promise<void> {
  await supabase.functions.invoke("notify-party-joined", {
    body: {
      party_id: params.partyId,
      party_name: params.partyName,
      leader_user_id: params.leaderUserId,
      joiner_nickname: params.joinerNickname,
    },
  });
}

const ACTIVITY_LABEL: Record<string, { verb: string; emoji: string }> = {
  러닝: { verb: "달려요", emoji: "🏃" },
  달리기: { verb: "달려요", emoji: "🏃" },
  파워워킹: { verb: "파워워킹해요", emoji: "💪" },
  "파워 워킹": { verb: "파워워킹해요", emoji: "💪" },
  등산: { verb: "등산해요", emoji: "⛰️" },
  산책: { verb: "산책해요", emoji: "🌿" },
};

export function resolveActivityLabel(tags: string[]): {
  verb: string;
  emoji: string;
} {
  for (const tag of tags) {
    const match = ACTIVITY_LABEL[tag];
    if (match) return match;
  }
  return { verb: "운동해요", emoji: "💪" };
}

export async function notifyPartyStarted(params: {
  memberUserIds: string[];
  leaderNickname: string;
  partyName: string;
  partyId: string;
  tags: string[];
}): Promise<{ error: string | null }> {
  const { error } = await supabase.functions.invoke("notify-party-start", {
    body: {
      party_id: params.partyId,
      party_name: params.partyName,
      leader_nickname: params.leaderNickname,
      member_ids: params.memberUserIds,
      tags: params.tags,
    },
  });
  if (error) {
    console.error("notify-party-start error:", error);
    return { error: error.message };
  }
  return { error: null };
}

export async function notifyGoalReached(params: {
  userId: string;
  goalType: string;
  goalValue: number;
}) {
  const label =
    params.goalType === "steps"
      ? `${params.goalValue.toLocaleString()} 걸음`
      : `${params.goalValue} km`;

  await createNotification({
    user_id: params.userId,
    type: "goal_reached",
    title: "목표 달성! 🎯",
    body: `오늘 ${label} 목표를 달성했어요! 정말 멋집니다. 내일도 함께 걸어요.`,
    data: { goal_type: params.goalType, goal_value: params.goalValue },
    is_read: false,
  });
}

export async function notifyStreakWarning(params: {
  userId: string;
  currentStreak: number;
}) {
  await createNotification({
    user_id: params.userId,
    type: "streak_warning",
    title: "스트릭이 끊길 것 같아요 🔥",
    body:
      params.currentStreak > 0
        ? `${params.currentStreak}일 연속 운동 중! 오늘도 잊지 말고 걸어요.`
        : "오늘 아직 운동을 안 했어요. 잠깐이라도 걸어볼까요?",
    data: { streak: params.currentStreak },
    is_read: false,
  });
}

export async function notifyDietReminder(params: {
  userId: string;
  mealType: "lunch" | "dinner";
}) {
  const title =
    params.mealType === "lunch"
      ? "🥗 점심 후 10분 걷기"
      : "🌙 오늘 운동한 만큼 건강하게";
  const body =
    params.mealType === "lunch"
      ? "식사 후 가볍게 걸으면 혈당 관리와 칼로리 소모에 도움이 됩니다."
      : "오늘 운동량에 맞는 저녁 식단을 확인해보세요.";

  await createNotification({
    user_id: params.userId,
    type: "diet_reminder",
    title,
    body,
    data: { meal_type: params.mealType },
    is_read: false,
  });
}
