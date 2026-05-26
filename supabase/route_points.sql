-- GPS 경로 포인트 컬럼 추가
-- 포맷: [{ lat: number, lng: number, timestamp: number }, ...]
ALTER TABLE workout_history
  ADD COLUMN IF NOT EXISTS route_points jsonb;
