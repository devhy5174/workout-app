import { createNotification } from "../lib/notificationService";

export async function notifyPartyJoined(params: {
  leaderUserId: string;
  joinerNickname: string;
  partyName: string;
  partyId: string;
}) {
  await createNotification({
    user_id: params.leaderUserId,
    type: "party_joined",
    title: "새 파티원이 합류했어요!",
    body: `${params.joinerNickname}님이 "${params.partyName}" 파티에 참가했어요 🎉`,
    data: { party_id: params.partyId },
    is_read: false,
  });
}

export async function notifyPartyStarted(params: {
  memberUserIds: string[];
  leaderNickname: string;
  partyName: string;
  partyId: string;
}) {
  await Promise.all(
    params.memberUserIds.map((userId) =>
      createNotification({
        user_id: userId,
        type: "party_started",
        title: "파티 운동이 시작됐어요!",
        body: `${params.leaderNickname}님이 "${params.partyName}" 운동을 시작했습니다. 같이 달려요! 🏃`,
        data: { party_id: params.partyId },
        is_read: false,
      }),
    ),
  );
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
    body: `오늘 ${label} 목표를 달성했어요! 정말 대단해요!`,
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
    params.mealType === "lunch" ? "점심 식사 후 가볍게 걸어요 🌿" : "저녁 식단 가이드 🌙";
  const body =
    params.mealType === "lunch"
      ? "점심 먹고 10분만 걸으면 칼로리 소모에 큰 도움이 돼요!"
      : "오늘 운동한 칼로리에 맞는 저녁 식단을 확인해보세요.";

  await createNotification({
    user_id: params.userId,
    type: "diet_reminder",
    title,
    body,
    data: { meal_type: params.mealType },
    is_read: false,
  });
}
