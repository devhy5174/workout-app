import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ACTIVITY_LABEL: Record<string, { verb: string; emoji: string }> = {
  러닝: { verb: "달려요", emoji: "🏃" },
  달리기: { verb: "달려요", emoji: "🏃" },
  파워워킹: { verb: "파워워킹해요", emoji: "💪" },
  "파워 워킹": { verb: "파워워킹해요", emoji: "💪" },
  등산: { verb: "등산해요", emoji: "⛰️" },
  산책: { verb: "산책해요", emoji: "🌿" },
};

function resolveActivityLabel(tags: string[]): { verb: string; emoji: string } {
  for (const tag of tags) {
    const match = ACTIVITY_LABEL[tag];
    if (match) return match;
  }
  return { verb: "운동해요", emoji: "💪" };
}

Deno.serve(async (req) => {
  console.log("[notify-party-start] 진입", req.method);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  // 호출자 JWT로 파티장 검증
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

  let body: {
    party_id: string;
    party_name: string;
    leader_nickname: string;
    member_ids: string[];
    tags: string[];
  };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
  }

  const { party_id, party_name, leader_nickname, member_ids, tags } = body;
  console.log(`[notify-party-start] 파티=${party_id} 파티원수=${member_ids?.length ?? 0}`);
  if (!party_id || !party_name || !leader_nickname || !member_ids?.length) {
    console.warn("[notify-party-start] 필수 필드 누락 → 400");
    return new Response("Missing required fields", { status: 400, headers: corsHeaders });
  }

  // service role로 파티 방장 여부 검증
  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: party, error: partyError } = await adminClient
    .from("parties")
    .select("created_by")
    .eq("id", party_id)
    .single();

  if (partyError || !party) {
    return new Response("Party not found", { status: 404, headers: corsHeaders });
  }
  if (party.created_by !== user.id) {
    return new Response("Forbidden: not the party leader", { status: 403, headers: corsHeaders });
  }

  const { verb, emoji } = resolveActivityLabel(tags ?? []);
  const notifications = member_ids.map((userId) => ({
    user_id: userId,
    type: "party_started",
    title: "파티 운동이 시작됐어요!",
    body: `${leader_nickname}님이 "${party_name}" 운동을 시작했습니다. 같이 ${verb} ${emoji}`,
    data: { party_id },
    is_read: false,
  }));

  const { error: insertError } = await adminClient
    .from("notifications")
    .insert(notifications);

  if (insertError) {
    console.error("[notify-party-start] notifications 삽입 실패:", insertError.message);
    return new Response(JSON.stringify({ error: insertError.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  console.log(`[notify-party-start] notifications 삽입 성공 ${notifications.length}건`);

  // FCM 푸시 발송 (앱 종료/백그라운드에서도 수신)
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const cronSecret = Deno.env.get("CRON_SECRET");
  const pushBody = JSON.stringify({
    userIds: member_ids,
    notification: {
      title: "파티 운동이 시작됐어요!",
      body: `${leader_nickname}님이 "${party_name}" 운동을 시작했습니다. 같이 ${verb} ${emoji}`,
      data: { type: "party_started", party_id },
    },
  });
  const pushHeaders = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
    ...(cronSecret ? { "x-cron-secret": cronSecret } : {}),
  };
  // FCM + 웹 푸시 동시 발송
  const fcmUrl = `${supabaseUrl}/functions/v1/notify-fcm`;
  console.log(`[notify-party-start] notify-fcm 호출 시작 url=${fcmUrl} 대상=${member_ids.length}명`);

  await Promise.allSettled([
    fetch(fcmUrl, {
      method: "POST",
      headers: pushHeaders,
      body: pushBody,
    }).then(async (r) => {
      const resBody = await r.text();
      console.log(`[notify-party-start] notify-fcm 응답 status=${r.status} body=${resBody}`);
    }).catch((e) => console.error("[notify-party-start] notify-fcm fetch 예외:", String(e))),
    fetch(`${supabaseUrl}/functions/v1/notify-push`, {
      method: "POST",
      headers: pushHeaders,
      body: pushBody,
    }).catch((e) => console.warn("[notify-party-start] notify-push fetch 예외:", String(e))),
  ]);

  return new Response(JSON.stringify({ sent: notifications.length }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
