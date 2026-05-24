-- FCM 토큰 저장 테이블 (Android 푸시 알림용)
create table if not exists fcm_tokens (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references app_users(id) on delete cascade,
  token      text not null unique,
  created_at timestamptz default now()
);

-- RLS
alter table fcm_tokens enable row level security;

create policy "본인 토큰 관리" on fcm_tokens
  for all using (auth.uid() = user_id);

-- service role은 모든 토큰 읽기 가능 (Edge Function에서 사용)
create policy "service role 전체 읽기" on fcm_tokens
  for select using (auth.role() = 'service_role');
