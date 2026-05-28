import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "https://esm.sh/web-push@3.6.7";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

webpush.setVapidDetails(
  `mailto:${Deno.env.get("VAPID_CONTACT_EMAIL") ?? "admin@example.com"}`,
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!,
);

type PushPayload = {
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

Deno.serve(async (req) => {
  const cronSecret = req.headers.get("x-cron-secret");
  const expectedToken = Deno.env.get("CRON_SECRET");
  const hasAuth = req.headers.get("Authorization");
  if (expectedToken && cronSecret !== expectedToken && !hasAuth) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: { userIds: string[]; notification: PushPayload };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { userIds, notification } = body;
  if (!userIds?.length || !notification) {
    return new Response("Missing userIds or notification", { status: 400 });
  }

  // 대상 유저들의 push_subscriptions 조회
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth_key")
    .in("user_id", userIds);

  if (error) {
    console.error("[notify-push] subscriptions fetch error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  if (!subscriptions || subscriptions.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const payload = JSON.stringify(notification);
  let sent = 0;
  const expired: string[] = [];

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      const pushSub = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth_key },
      };
      try {
        await webpush.sendNotification(pushSub, payload);
        sent++;
      } catch (err: any) {
        // 410 Gone = 구독 만료 → DB에서 제거
        if (err.statusCode === 410 || err.statusCode === 404) {
          expired.push(sub.endpoint);
        } else {
          console.error("[notify-push] send error:", err.message);
        }
      }
    }),
  );

  // 만료된 구독 일괄 삭제
  if (expired.length > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("endpoint", expired);
    console.log(`[notify-push] removed ${expired.length} expired subscriptions`);
  }

  console.log(`[notify-push] sent=${sent} expired=${expired.length}`);
  return new Response(JSON.stringify({ sent, expired: expired.length }), {
    headers: { "Content-Type": "application/json" },
  });
});
