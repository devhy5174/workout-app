-- ────────────────────────────────────────────────────────────
-- 기존 스케줄 삭제 (재실행 시 충돌 방지)
-- ────────────────────────────────────────────────────────────
SELECT cron.unschedule('activity-reminder')   WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'activity-reminder');
SELECT cron.unschedule('diet-lunch-reminder') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'diet-lunch-reminder');
SELECT cron.unschedule('diet-dinner-reminder') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'diet-dinner-reminder');
SELECT cron.unschedule('streak-warning')      WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'streak-warning');


-- ────────────────────────────────────────────────────────────
-- 헬퍼: Edge Function 호출 함수
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.call_notify_scheduled(schedule_type TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM net.http_post(
    url     := 'https://arqxwbtvezqrkuyjjvlw.supabase.co/functions/v1/notify-scheduled',
    headers := jsonb_build_object(
      'Content-Type',   'application/json',
      'x-cron-secret',  'bcec67cc85eb5d362757a35fef4a336e83fe6d78750101d06668a78ad410764e'
    ),
    body    := jsonb_build_object('type', schedule_type)
  );
END;
$$;


-- ────────────────────────────────────────────────────────────
-- 스케줄 등록 (모두 KST = UTC+9 기준)
-- ────────────────────────────────────────────────────────────

-- 오후 12시 KST (03:00 UTC): 오늘 운동 아직 안 한 유저 독려
SELECT cron.schedule(
  'activity-reminder',
  '0 3 * * *',
  $$ SELECT public.call_notify_scheduled('activity_reminder'); $$
);

-- 오후 1시 KST (04:00 UTC): 점심 후 걷기 + 식단 리마인더
SELECT cron.schedule(
  'diet-lunch-reminder',
  '0 4 * * *',
  $$ SELECT public.call_notify_scheduled('diet_lunch'); $$
);

-- 오후 6시 KST (09:00 UTC): 오늘 운동 완료한 유저 저녁 식단 가이드
SELECT cron.schedule(
  'diet-dinner-reminder',
  '0 9 * * *',
  $$ SELECT public.call_notify_scheduled('diet_dinner'); $$
);

-- 오후 8시 KST (11:00 UTC): 오늘 운동 안 한 활성 유저 스트릭 경고
SELECT cron.schedule(
  'streak-warning',
  '0 11 * * *',
  $$ SELECT public.call_notify_scheduled('streak_warning'); $$
);


-- ────────────────────────────────────────────────────────────
-- 확인
-- ────────────────────────────────────────────────────────────
SELECT jobname, schedule, active FROM cron.job ORDER BY jobname;
