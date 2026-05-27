-- 파티 목표 유형 컬럼 추가 (걸음수 / 거리)
-- 실행: Supabase Dashboard > SQL Editor 에서 한 번 실행

ALTER TABLE parties
  ADD COLUMN IF NOT EXISTS goal_type      text DEFAULT 'steps',
  ADD COLUMN IF NOT EXISTS target_distance numeric;

UPDATE parties
SET goal_type = 'steps'
WHERE goal_type IS NULL;
