-- app_users 에 파티 MVP 횟수 컬럼 추가
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS party_mvp_count integer DEFAULT 0;

-- MVP 카운트 안전 증가 함수 (SECURITY DEFINER — RLS 우회해서 서버 측 증가)
CREATE OR REPLACE FUNCTION increment_party_mvp_count(target_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE app_users
  SET party_mvp_count = COALESCE(party_mvp_count, 0) + 1
  WHERE id = target_user_id;
$$;
