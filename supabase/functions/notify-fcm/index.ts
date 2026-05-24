import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// 서비스 계정 JSON으로 Google OAuth2 access token 발급
async function getAccessToken(): Promise<string> {
  const raw = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON")!;
  const sa = JSON.parse(raw);

  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const toB64url = (s: string) =>
    btoa(s).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const header = toB64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = toB64url(JSON.stringify(claim));
  const sigInput = `${header}.${payload}`;

  const pemBody = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\n/g, "");

  const keyData = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyData,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(sigInput),
  );
  const sigB64 = toB64url(String.fromCharCode(...new Uint8Array(sig)));
  const jwt = `${sigInput}.${sigB64}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const json = await res.json() as { access_token: string };
  return json.access_token;
}

type PushPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

Deno.serve(async (req) => {
  console.log("[notify-fcm] 호출됨", req.method);
  // 인증: cron secret 또는 Supabase JWT 허용
  const cronSecret = req.headers.get("x-cron-secret");
  const expectedSecret = Deno.env.get("CRON_SECRET");
  const hasAuth = req.headers.get("Authorization");
  if (expectedSecret && cronSecret !== expectedSecret && !hasAuth) {
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

  // 대상 유저들의 FCM 토큰 조회
  const { data: rows, error } = await supabase
    .from("fcm_tokens")
    .select("token")
    .in("user_id", userIds);

  if (error) {
    console.error("[notify-fcm] DB error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  if (!rows?.length) {
    return new Response(JSON.stringify({ sent: 0 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const projectId = Deno.env.get("FIREBASE_PROJECT_ID")!;
  const accessToken = await getAccessToken();
  const dataStrings: Record<string, string> = Object.fromEntries(
    Object.entries(notification.data ?? {}).map(([k, v]) => [k, String(v)]),
  );

  let sent = 0;
  const expired: string[] = [];

  await Promise.allSettled(
    rows.map(async ({ token }) => {
      const res = await fetch(
        `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: {
              token,
              notification: { title: notification.title, body: notification.body },
              data: dataStrings,
              android: {
                priority: "high",
                notification: {
                  channel_id: "default",
                  visibility: "PUBLIC",
                  sound: "default",
                },
              },
            },
          }),
        },
      );

      if (res.ok) {
        sent++;
      } else {
        const err = await res.json() as { error?: { code?: number; details?: { errorCode?: string }[] } };
        const code = err.error?.code;
        const errCode = err.error?.details?.[0]?.errorCode;
        if (code === 404 || errCode === "UNREGISTERED") {
          expired.push(token);
        } else {
          console.error("[notify-fcm] FCM error:", JSON.stringify(err));
        }
      }
    }),
  );

  if (expired.length > 0) {
    await supabase.from("fcm_tokens").delete().in("token", expired);
    console.log(`[notify-fcm] 만료 토큰 ${expired.length}개 삭제`);
  }

  console.log(`[notify-fcm] sent=${sent} expired=${expired.length}`);
  return new Response(JSON.stringify({ sent, expired: expired.length }), {
    headers: { "Content-Type": "application/json" },
  });
});
