-- GPS 거리 추적 컬럼 추가
-- 실행: Supabase Dashboard > SQL Editor 에서 한 번 실행

ALTER TABLE workout_history
  ADD COLUMN IF NOT EXISTS gps_distance    numeric,
  ADD COLUMN IF NOT EXISTS distance_source text DEFAULT 'estimated',
  ADD COLUMN IF NOT EXISTS avg_pace        numeric;

-- 기존 레코드를 모두 'estimated'로 처리 (신규 컬럼 기본값은 DEFAULT가 채우지만 명시적으로 보장)
UPDATE workout_history
SET distance_source = 'estimated'
WHERE distance_source IS NULL;
