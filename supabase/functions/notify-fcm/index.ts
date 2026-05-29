import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// 서비스 계정 JSON으로 Google OAuth2 access token 발급
async function getAccessToken(): Promise<string> {
  const raw = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");
  if (!raw) throw new Error("[notify-fcm] FIREBASE_SERVICE_ACCOUNT_JSON 환경변수 없음");

  let sa: { client_email?: string; private_key?: string };
  try {
    sa = JSON.parse(raw);
    console.log("[notify-fcm] service account 파싱 성공, client_email 존재:", !!sa.client_email);
  } catch (e) {
    throw new Error(`[notify-fcm] FIREBASE_SERVICE_ACCOUNT_JSON JSON 파싱 실패: ${e}`);
  }

  if (!sa.client_email || !sa.private_key) {
    throw new Error("[notify-fcm] service account에 client_email 또는 private_key 없음");
  }

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

  const oauthRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const oauthBody = await oauthRes.text();
  if (!oauthRes.ok) {
    throw new Error(`[notify-fcm] OAuth2 토큰 발급 실패 status=${oauthRes.status} body=${oauthBody}`);
  }

  let oauthJson: { access_token?: string };
  try {
    oauthJson = JSON.parse(oauthBody);
  } catch {
    throw new Error(`[notify-fcm] OAuth2 응답 파싱 실패: ${oauthBody}`);
  }

  if (!oauthJson.access_token) {
    throw new Error(`[notify-fcm] OAuth2 응답에 access_token 없음: ${oauthBody}`);
  }

  console.log("[notify-fcm] OAuth2 access_token 발급 성공");
  return oauthJson.access_token;
}

type PushPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  console.log("[notify-fcm] 호출됨", req.method);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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

  console.log(`[notify-fcm] 대상 userIds: ${JSON.stringify(userIds)}`);

  // FIREBASE_PROJECT_ID 존재 확인
  const projectId = Deno.env.get("FIREBASE_PROJECT_ID");
  if (!projectId) {
    console.error("[notify-fcm] FIREBASE_PROJECT_ID 환경변수 없음");
    return new Response(JSON.stringify({ error: "FIREBASE_PROJECT_ID 없음" }), { status: 500 });
  }
  console.log("[notify-fcm] FIREBASE_PROJECT_ID 존재:", !!projectId);

  // 대상 유저들의 FCM 토큰 조회
  const { data: rows, error } = await supabase
    .from("fcm_tokens")
    .select("token")
    .in("user_id", userIds);

  if (error) {
    console.error("[notify-fcm] fcm_tokens DB 조회 실패:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  console.log(`[notify-fcm] fcm_tokens 조회 결과: ${rows?.length ?? 0}개`);

  if (!rows?.length) {
    return new Response(JSON.stringify({ sent: 0, reason: "no_tokens" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  let accessToken: string;
  try {
    accessToken = await getAccessToken();
  } catch (e) {
    console.error("[notify-fcm] getAccessToken 실패:", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }

  const dataStrings: Record<string, string> = Object.fromEntries(
    Object.entries(notification.data ?? {}).map(([k, v]) => [k, String(v)]),
  );

  let sent = 0;
  const expired: string[] = [];

  await Promise.allSettled(
    rows.map(async ({ token }) => {
      const fcmPayload = {
        message: {
          token,
          notification: { title: notification.title, body: notification.body },
          data: dataStrings,
          android: {
            priority: "HIGH",
            notification: {
              channel_id: "default",
              notification_priority: "PRIORITY_HIGH",
              visibility: "PUBLIC",
              sound: "default",
            },
          },
        },
      };
      console.log(`[notify-fcm] FCM payload: ${JSON.stringify(fcmPayload).replace(token, "...<token>")}`);

      const fcmRes = await fetch(
        `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(fcmPayload),
        },
      );

      const fcmBody = await fcmRes.text();
      if (fcmRes.ok) {
        sent++;
        console.log(`[notify-fcm] FCM 전송 성공 token=...${token.slice(-10)}`);
      } else {
        console.error(`[notify-fcm] FCM 전송 실패 status=${fcmRes.status} body=${fcmBody} token=...${token.slice(-10)}`);
        let err: { error?: { code?: number; details?: { errorCode?: string }[] } } = {};
        try { err = JSON.parse(fcmBody); } catch { /* ignore */ }
        const code = err.error?.code;
        const errCode = err.error?.details?.[0]?.errorCode;
        if (code === 404 || errCode === "UNREGISTERED") {
          expired.push(token);
        }
      }
    }),
  );

  if (expired.length > 0) {
    await supabase.from("fcm_tokens").delete().in("token", expired);
    console.log(`[notify-fcm] 만료 토큰 ${expired.length}개 삭제`);
  }

  console.log(`[notify-fcm] 완료 sent=${sent} expired=${expired.length}`);
  return new Response(JSON.stringify({ sent, expired: expired.length }), {
    headers: { "Content-Type": "application/json" },
  });
});
