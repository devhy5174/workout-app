-- ============================================================
-- 이벤트 시스템 마이그레이션
-- Supabase SQL Editor에서 실행하세요
-- ============================================================

-- 1. events 테이블
create table if not exists events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text default '',
  start_date date not null,
  end_date date not null,
  category text not null check (category in ('personal', 'party', 'streak')),
  condition_type text not null check (condition_type in ('period_goal', 'avg_steps', 'total_steps', 'consecutive_days')),
  condition_value integer not null check (condition_value > 0),
  reward_type text not null check (reward_type in ('bubble', 'title', 'both')),
  bubble_id text,
  title_text text,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table events enable row level security;

create policy "events_select_all" on events
  for select using (true);

create policy "events_insert_admin" on events
  for insert with check (
    coalesce((select is_admin from app_users where id = auth.uid()), false)
  );

create policy "events_update_admin" on events
  for update using (
    coalesce((select is_admin from app_users where id = auth.uid()), false)
  );

create policy "events_delete_admin" on events
  for delete using (
    coalesce((select is_admin from app_users where id = auth.uid()), false)
  );

-- 2. event_grants 테이블 (관리자 보상 지급 기록)
create table if not exists event_grants (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) on delete cascade not null,
  user_id uuid not null,
  reward_type text not null,
  bubble_id text,
  title_text text,
  granted_at timestamptz default now(),
  granted_by uuid
);

alter table event_grants enable row level security;

create policy "event_grants_select_own" on event_grants
  for select using (auth.uid() = user_id);

create policy "event_grants_insert_admin" on event_grants
  for insert with check (
    coalesce((select is_admin from app_users where id = auth.uid()), false)
  );

-- 3. workout_history 관리자 전체 읽기 정책 추가
--    (달성자 집계에 필요. 기존 "본인 읽기" 정책과 OR 조합됨)
create policy "workout_history_admin_read" on workout_history
  for select using (
    coalesce((select is_admin from app_users where id = auth.uid()), false)
  );
