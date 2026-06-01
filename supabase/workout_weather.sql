-- workout_history 에 날씨 조건 컬럼 추가
-- 운동 저장 시 현재 날씨 상태를 기록 (rainy, snow, sunny, cloudy, hot, cold)
ALTER TABLE workout_history ADD COLUMN IF NOT EXISTS weather_condition text;
