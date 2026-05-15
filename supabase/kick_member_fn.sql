-- Supabase SQL Editor에서 실행하세요
-- 방장이 파티원을 강퇴할 수 있는 RPC 함수

CREATE OR REPLACE FUNCTION kick_party_member(
  p_party_id uuid,
  p_target_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 호출자가 해당 파티의 방장인지 검증
  IF NOT EXISTS (
    SELECT 1 FROM parties
    WHERE id = p_party_id AND created_by = auth.uid()
  ) THEN
    RAISE EXCEPTION '권한이 없습니다: 파티 방장만 강퇴할 수 있어요';
  END IF;

  -- 방장은 자기 자신을 강퇴할 수 없음
  IF p_target_user_id = auth.uid() THEN
    RAISE EXCEPTION '방장은 자기 자신을 강퇴할 수 없어요';
  END IF;

  DELETE FROM party_members
  WHERE party_id = p_party_id AND user_id = p_target_user_id;
END;
$$;
