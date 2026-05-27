-- community_posts 자동 포스팅 중복 방지용 컬럼 & unique index
ALTER TABLE community_posts
  ADD COLUMN IF NOT EXISTS source_type text,
  ADD COLUMN IF NOT EXISTS source_id   text,
  ADD COLUMN IF NOT EXISTS source_date date;

-- (source_type, source_id, source_date) 조합이 같은 행은 1개만 허용
-- NULL 값은 unique 제약에서 제외되므로 일반 포스팅에는 영향 없음
CREATE UNIQUE INDEX IF NOT EXISTS uniq_community_posts_source
  ON community_posts (source_type, source_id, source_date)
  WHERE source_type IS NOT NULL;
