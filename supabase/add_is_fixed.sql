-- ============================================================
-- 고정 이벤트 지원 마이그레이션
-- Supabase SQL Editor에서 실행하세요
-- ============================================================

-- 1. events 테이블에 is_fixed 컬럼 추가
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_fixed boolean DEFAULT false;

-- 2. 고정 이벤트 self-grant 정책 추가
--    유저가 자신의 고정 이벤트 달성을 직접 기록할 수 있도록 허용
CREATE POLICY "event_grants_self_grant_fixed" ON event_grants
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (SELECT 1 FROM events WHERE id = event_id AND is_fixed = true)
  );
