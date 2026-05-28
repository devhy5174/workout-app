import { supabase } from "./supabase";

export type NotificationType =
  | "party_joined"
  | "party_started"
  | "goal_reached"
  | "streak_warning"
  | "diet_reminder"
  | "system"
  | "event";

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
};

export async function fetchNotifications(
  userId: string,
  limit = 30,
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("notifications fetch error:", error);
    return [];
  }
  return (data as Notification[]) ?? [];
}

export async function markAsRead(notificationId: string): Promise<void> {
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);
}

export async function markAllAsRead(userId: string): Promise<void> {
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);
}

export async function deleteNotification(notificationId: string): Promise<void> {
  await supabase.from("notifications").delete().eq("id", notificationId);
}

export async function createNotification(
  notification: Omit<Notification, "id" | "created_at">,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("notifications").insert(notification);
  if (error) return { error: error.message };

  // FCM 푸시 발송 (Android) — fire-and-forget
  supabase.functions.invoke("notify-fcm", {
    body: {
      userIds: [notification.user_id],
      notification: {
        title: notification.title,
        body: notification.body,
        data: notification.data ?? {},
      },
    },
  }).catch(() => {});

  return { error: null };
}

// 개발/테스트용: Edge Function 수동 트리거
export async function triggerScheduledNotification(
  type: "streak_warning" | "activity_reminder" | "diet_lunch" | "diet_dinner",
): Promise<{ sent: number; error: string | null }> {
  const { data, error } = await supabase.functions.invoke("notify-scheduled", {
    body: { type },
  });
  if (error) return { sent: 0, error: error.message };
  return { sent: (data as any)?.sent ?? 0, error: null };
}

// 웹 푸시 구독 저장
export async function savePushSubscription(
  userId: string,
  sub: PushSubscription,
): Promise<{ error: string | null }> {
  const json = sub.toJSON();
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: userId,
      endpoint: sub.endpoint,
      p256dh: json.keys?.p256dh ?? "",
      auth_key: json.keys?.auth ?? "",
    },
    { onConflict: "endpoint" },
  );
  return { error: error?.message ?? null };
}

// 웹 푸시 구독 삭제
export async function deletePushSubscription(endpoint: string): Promise<void> {
  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
}
