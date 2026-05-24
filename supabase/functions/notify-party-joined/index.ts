import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

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
    leader_user_id: string;
    joiner_nickname: string;
  };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
  }

  const { party_id, party_name, leader_user_id, joiner_nickname } = body;
  if (!party_id || !party_name || !leader_user_id || !joiner_nickname) {
    return new Response("Missing required fields", { status: 400, headers: corsHeaders });
  }

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // 호출자가 실제로 해당 파티 멤버인지 검증
  const { data: membership } = await adminClient
    .from("party_members")
    .select("id")
    .eq("party_id", party_id)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return new Response("Forbidden: not a party member", { status: 403, headers: corsHeaders });
  }

  const { error: insertError } = await adminClient
    .from("notifications")
    .insert({
      user_id: leader_user_id,
      type: "party_joined",
      title: "새 파티원이 합류했어요!",
      body: `${joiner_nickname}님이 "${party_name}" 파티에 참가했어요 🎉`,
      data: { party_id },
      is_read: false,
    });

  if (insertError) {
    return new Response(JSON.stringify({ error: insertError.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // FCM 푸시 (파티장에게)
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const cronSecret = Deno.env.get("CRON_SECRET");
  await fetch(`${supabaseUrl}/functions/v1/notify-fcm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      ...(cronSecret ? { "x-cron-secret": cronSecret } : {}),
    },
    body: JSON.stringify({
      userIds: [leader_user_id],
      notification: {
        title: "새 파티원이 합류했어요!",
        body: `${joiner_nickname}님이 "${party_name}" 파티에 참가했어요 🎉`,
        data: { type: "party_joined", party_id },
      },
    }),
  }).catch((e) => console.warn("[notify-party-joined] FCM call failed:", e));

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
