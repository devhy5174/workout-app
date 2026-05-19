-- ============================================================
-- notifications 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT        NOT NULL,  -- 'party_joined' | 'party_started' | 'goal_reached' | 'streak_warning' | 'diet_reminder' | 'system'
  title       TEXT        NOT NULL,
  body        TEXT        NOT NULL,
  data        JSONB       DEFAULT '{}'::jsonb,
  is_read     BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx      ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_user_unread_idx  ON notifications(user_id) WHERE is_read = false;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "본인 알림 읽기"      ON notifications;
DROP POLICY IF EXISTS "본인 알림 읽음 처리" ON notifications;
DROP POLICY IF EXISTS "본인 알림 삭제"      ON notifications;
DROP POLICY IF EXISTS "알림 생성"           ON notifications;

CREATE POLICY "본인 알림 읽기" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "본인 알림 읽음 처리" ON notifications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "본인 알림 삭제" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "알림 생성" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Realtime 활성화 (이미 등록된 경우 무시)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
END $$;


-- ============================================================
-- push_subscriptions 테이블 (웹 푸시)
-- ============================================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint    TEXT        NOT NULL UNIQUE,
  p256dh      TEXT        NOT NULL,
  auth_key    TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "본인 구독 관리" ON push_subscriptions;

CREATE POLICY "본인 구독 관리" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
