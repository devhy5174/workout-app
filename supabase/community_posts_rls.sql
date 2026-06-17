-- community_posts RLS 정책 확인 및 추가
-- Supabase SQL Editor에서 실행하세요

-- 1. 현재 community_posts에 걸린 정책 확인
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'community_posts';

-- 2. UPDATE 정책 추가 (작성자 본인만 수정 가능)
--    이미 존재하면 에러 → 아래 DROP 후 재생성 또는 CREATE OR REPLACE 사용
CREATE POLICY "본인 글 수정 (UPDATE)"
  ON community_posts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
