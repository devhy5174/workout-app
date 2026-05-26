import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// KST (UTC+9) 기준 오늘 날짜 문자열 반환
function kstDateStr(): string {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return now.toISOString().slice(0, 10);
}

type NotificationType =
  | "streak_warning"
  | "diet_reminder"
  | "system";

type NotificationRow = {
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
};

type ScheduleType =
  | "streak_warning"     // 오후 8시 KST — 오늘 운동 안 한 유저
  | "activity_reminder"  // 오후 12시 KST — 오늘 아직 운동 안 한 유저
  | "diet_lunch"         // 오후 1시 KST  — 전체 유저
  | "diet_dinner";       // 오후 6시 KST  — 오늘 운동 완료한 유저

Deno.serve(async (req) => {
  // x-cron-secret 헤더로 인증 (Authorization은 Supabase JWT 전용)
  const cronSecret = req.headers.get("x-cron-secret");
  const expectedToken = Deno.env.get("CRON_SECRET");
  if (expectedToken && cronSecret !== expectedToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  let scheduleType: ScheduleType;
  try {
    const body = await req.json();
    scheduleType = body.type as ScheduleType;
  } catch {
    const url = new URL(req.url);
    scheduleType = url.searchParams.get("type") as ScheduleType;
  }

  if (!scheduleType) {
    return new Response("Missing type", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, // service role → RLS 우회
  );

  const today = kstDateStr();
  let notifications: NotificationRow[] = [];

  try {
    switch (scheduleType) {
      // ─────────────────────────────────────────────────────────
      // 오후 12시: 오늘 아직 운동 안 한 유저에게 활동 독려
      // ─────────────────────────────────────────────────────────
      case "activity_reminder": {
        // 최근 7일 내 운동 기록이 있는 "활성 유저"만 대상
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10);

        const { data: recentActive } = await supabase
          .from("workout_history")
          .select("user_id")
          .gte("date", weekAgo);

        const activeUserIds = [...new Set((recentActive ?? []).map((r: any) => r.user_id))];
        if (activeUserIds.length === 0) break;

        // 오늘 이미 운동한 유저 제외
        const { data: todayWorkouts } = await supabase
          .from("workout_history")
          .select("user_id")
          .eq("date", today)
          .in("user_id", activeUserIds);

        const doneToday = new Set((todayWorkouts ?? []).map((r: any) => r.user_id));
        const targets = activeUserIds.filter((id) => !doneToday.has(id));

        // 오늘 이미 이 알림 받은 유저 제외 (중복 방지)
        if (targets.length > 0) {
          const { data: alreadySent } = await supabase
            .from("notifications")
            .select("user_id")
            .in("user_id", targets)
            .eq("type", "streak_warning")
            .gte("created_at", `${today}T00:00:00+09:00`);

          const sentIds = new Set((alreadySent ?? []).map((r: any) => r.user_id));
          const finalTargets = targets.filter((id) => !sentIds.has(id));

          notifications = finalTargets.map((userId) => ({
            user_id: userId,
            type: "streak_warning",
            title: "오늘 운동 어때요? 🏃",
            body: "아직 오늘 운동을 안 하셨어요. 잠깐이라도 걸어볼까요?",
            data: { schedule: "activity_reminder" },
            is_read: false,
          }));
        }
        break;
      }

      // ─────────────────────────────────────────────────────────
      // 오후 1시: 점심 식단 리마인더 (최근 7일 활성 유저 전체)
      // ─────────────────────────────────────────────────────────
      case "diet_lunch": {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10);

        const { data: recentActive } = await supabase
          .from("workout_history")
          .select("user_id")
          .gte("date", weekAgo);

        const activeUserIds = [...new Set((recentActive ?? []).map((r: any) => r.user_id))];

        // 오늘 이미 보낸 유저 제외
        if (activeUserIds.length > 0) {
          const { data: alreadySent } = await supabase
            .from("notifications")
            .select("user_id")
            .in("user_id", activeUserIds)
            .eq("type", "diet_reminder")
            .like("data->>'schedule'", "diet_lunch")
            .gte("created_at", `${today}T00:00:00+09:00`);

          const sentIds = new Set((alreadySent ?? []).map((r: any) => r.user_id));
          const targets = activeUserIds.filter((id) => !sentIds.has(id));

          notifications = targets.map((userId) => ({
            user_id: userId,
            type: "diet_reminder",
            title: "점심 후 10분 걷기 🌿",
            body: "점심 식사 후 가볍게 걸으면 칼로리 소모에 큰 도움이 돼요!",
            data: { schedule: "diet_lunch" },
            is_read: false,
          }));
        }
        break;
      }

      // ─────────────────────────────────────────────────────────
      // 오후 6시: 저녁 식단 가이드 (오늘 운동 완료한 유저)
      // ─────────────────────────────────────────────────────────
      case "diet_dinner": {
        const { data: todayWorkouts } = await supabase
          .from("workout_history")
          .select("user_id, calories")
          .eq("date", today);

        if (!todayWorkouts || todayWorkouts.length === 0) break;

        // 유저별 오늘 총 칼로리
        const calMap = new Map<string, number>();
        for (const w of todayWorkouts) {
          calMap.set(w.user_id, (calMap.get(w.user_id) ?? 0) + (w.calories ?? 0));
        }

        const targets = [...calMap.keys()];

        // 오늘 이미 보낸 유저 제외
        const { data: alreadySent } = await supabase
          .from("notifications")
          .select("user_id")
          .in("user_id", targets)
          .eq("type", "diet_reminder")
          .like("data->>'schedule'", "diet_dinner")
          .gte("created_at", `${today}T00:00:00+09:00`);

        const sentIds = new Set((alreadySent ?? []).map((r: any) => r.user_id));

        notifications = targets
          .filter((id) => !sentIds.has(id))
          .map((userId) => {
            const kcal = calMap.get(userId) ?? 0;
            return {
              user_id: userId,
              type: "diet_reminder",
              title: "오늘 운동 성공! 저녁 식단 가이드 🌙",
              body: `오늘 ${kcal}kcal 소모했어요. 맞춤 저녁 식단을 확인해보세요!`,
              data: { schedule: "diet_dinner", burned_kcal: kcal },
              is_read: false,
            };
          });
        break;
      }

      // ─────────────────────────────────────────────────────────
      // 오후 8시: 스트릭 경고 (오늘 운동 안 한 활성 유저)
      // ─────────────────────────────────────────────────────────
      case "streak_warning": {
        // 최근 3일 내 운동 기록이 있는 유저만 (진짜 활성 유저)
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10);

        const { data: recentWorkouts } = await supabase
          .from("workout_history")
          .select("user_id, date")
          .gte("date", threeDaysAgo);

        if (!recentWorkouts || recentWorkouts.length === 0) break;

        const activeUserIds = [...new Set(recentWorkouts.map((r: any) => r.user_id))];

        // 오늘 운동한 유저 제외
        const todayWorkers = new Set(
          recentWorkouts.filter((r: any) => r.date === today).map((r: any) => r.user_id),
        );
        const targets = activeUserIds.filter((id) => !todayWorkers.has(id));

        if (targets.length === 0) break;

        // 오늘 이미 streak_warning 받은 유저 제외
        const { data: alreadySent } = await supabase
          .from("notifications")
          .select("user_id")
          .in("user_id", targets)
          .eq("type", "streak_warning")
          .gte("created_at", `${today}T00:00:00+09:00`);

        const sentIds = new Set((alreadySent ?? []).map((r: any) => r.user_id));

        // 유저별 스트릭 계산 (연속 일수)
        const workoutDates = new Map<string, Set<string>>();
        for (const w of recentWorkouts) {
          if (!workoutDates.has(w.user_id)) workoutDates.set(w.user_id, new Set());
          workoutDates.get(w.user_id)!.add(w.date);
        }

        notifications = targets
          .filter((id) => !sentIds.has(id))
          .map((userId) => {
            const dates = workoutDates.get(userId) ?? new Set();
            // 어제~3일 전 연속 체크
            let streak = 0;
            const d = new Date(Date.now() + 9 * 60 * 60 * 1000);
            d.setDate(d.getDate() - 1); // 어제부터
            while (dates.has(d.toISOString().slice(0, 10))) {
              streak++;
              d.setDate(d.getDate() - 1);
            }
            return {
              user_id: userId,
              type: "streak_warning",
              title: streak > 0 ? `${streak}일 스트릭 지켜요! 🔥` : "오늘 운동 잊지 마세요 🔥",
              body:
                streak > 0
                  ? `${streak}일 연속 달성 중! 오늘도 잠깐만 걸으면 스트릭이 이어져요.`
                  : "오늘 아직 운동을 안 하셨어요. 잠깐이라도 걸어볼까요?",
              data: { schedule: "streak_warning", streak },
              is_read: false,
            };
          });
        break;
      }

      default:
        return new Response(`Unknown type: ${scheduleType}`, { status: 400 });
    }

    if (notifications.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 배치 INSERT (1회 왕복)
    const { error } = await supabase.from("notifications").insert(notifications);
    if (error) throw error;

    // 웹 푸시 + FCM 동시 발송 (Android 잠금화면 포함)
    const uniqueUserIds = [...new Set(notifications.map((n) => n.user_id))];
    const firstNotif = notifications[0];
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const pushBody = JSON.stringify({
      userIds: uniqueUserIds,
      notification: {
        title: firstNotif.title,
        body: firstNotif.body,
        data: { type: firstNotif.type, schedule: scheduleType },
      },
    });
    const authHeaders = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      ...(expectedToken ? { "x-cron-secret": expectedToken } : {}),
    };

    await Promise.allSettled([
      fetch(`${supabaseUrl}/functions/v1/notify-push`, {
        method: "POST",
        headers: authHeaders,
        body: pushBody,
      }).catch((e) => console.warn("[notify-scheduled] push call failed:", e)),
      fetch(`${supabaseUrl}/functions/v1/notify-fcm`, {
        method: "POST",
        headers: authHeaders,
        body: pushBody,
      }).catch((e) => console.warn("[notify-scheduled] FCM call failed:", e)),
    ]);

    console.log(`[notify-scheduled] type=${scheduleType} sent=${notifications.length}`);
    return new Response(JSON.stringify({ sent: notifications.length }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[notify-scheduled] error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
