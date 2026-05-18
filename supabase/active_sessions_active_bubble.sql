-- 파티 말풍선: Step에서 선택한 unlock item id를 활동 세션에 저장
-- (예: basic_bubble, cute_bubble, premium_active_bubble)
ALTER TABLE public.active_sessions
  ADD COLUMN IF NOT EXISTS active_bubble text;

COMMENT ON COLUMN public.active_sessions.active_bubble IS
  '파티 활동 말풍선 unlock item id; 운동 시작 시 로컬 선호값으로 채워짐';
