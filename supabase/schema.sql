-- ─── Extensions ──────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";

-- ─── Tables ───────────────────────────────────────────────────────────────────

create table spaces (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  description      text,
  default_expire_days int,
  cleanup_message  text,
  created_by       uuid references auth.users(id) on delete set null,
  created_at       timestamptz not null default now()
);

create table fridges (
  id         uuid primary key default gen_random_uuid(),
  space_id   uuid not null references spaces(id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now()
);

create table memberships (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  space_id   uuid not null references spaces(id) on delete cascade,
  role       text not null check (role in ('owner', 'admin', 'member')) default 'member',
  created_at timestamptz not null default now(),
  unique (user_id, space_id)
);

create table items (
  id           uuid primary key default gen_random_uuid(),
  fridge_id    uuid not null references fridges(id) on delete cascade,
  name         text not null,
  owner_name   text not null,
  owner_id     uuid references auth.users(id) on delete set null,
  is_anonymous boolean not null default false,
  expire_date  date,
  memo         text,
  image_url    text,
  status       text not null check (status in ('active', 'consumed', 'discarded', 'cleaned')) default 'active',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table item_logs (
  id           uuid primary key default gen_random_uuid(),
  item_id      uuid not null references items(id) on delete cascade,
  action       text not null check (action in ('consume', 'take', 'discard', 'admin_clean')),
  performed_by uuid references auth.users(id) on delete set null,
  note         text,
  created_at   timestamptz not null default now()
);

-- ─── updated_at 트리거 ─────────────────────────────────────────────────────────

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger items_updated_at
  before update on items
  for each row execute function update_updated_at();

-- ─── RLS 활성화 ───────────────────────────────────────────────────────────────

alter table spaces     enable row level security;
alter table fridges    enable row level security;
alter table memberships enable row level security;
alter table items      enable row level security;
alter table item_logs  enable row level security;

-- ─── spaces 정책 ──────────────────────────────────────────────────────────────
-- QR/URL로 접근하는 공개 서비스이므로 누구나 조회 가능

create policy "spaces: 누구나 조회" on spaces
  for select using (true);

create policy "spaces: 인증 사용자 생성" on spaces
  for insert with check (auth.uid() is not null);

create policy "spaces: owner만 수정" on spaces
  for update using (
    exists (
      select 1 from memberships
      where space_id = spaces.id
        and user_id = auth.uid()
        and role = 'owner'
    )
  );

create policy "spaces: owner만 삭제" on spaces
  for delete using (
    exists (
      select 1 from memberships
      where space_id = spaces.id
        and user_id = auth.uid()
        and role = 'owner'
    )
  );

-- ─── fridges 정책 ─────────────────────────────────────────────────────────────

create policy "fridges: 누구나 조회" on fridges
  for select using (true);

create policy "fridges: owner/admin만 생성" on fridges
  for insert with check (
    exists (
      select 1 from memberships
      where space_id = fridges.space_id
        and user_id = auth.uid()
        and role in ('owner', 'admin')
    )
  );

create policy "fridges: owner/admin만 삭제" on fridges
  for delete using (
    exists (
      select 1 from memberships
      where space_id = fridges.space_id
        and user_id = auth.uid()
        and role in ('owner', 'admin')
    )
  );

-- ─── memberships 정책 ─────────────────────────────────────────────────────────

create policy "memberships: 본인 조회" on memberships
  for select using (user_id = auth.uid());

create policy "memberships: owner만 관리" on memberships
  for insert with check (
    exists (
      select 1 from memberships m
      where m.space_id = memberships.space_id
        and m.user_id = auth.uid()
        and m.role = 'owner'
    )
  );

create policy "memberships: owner만 수정" on memberships
  for update using (
    exists (
      select 1 from memberships m
      where m.space_id = memberships.space_id
        and m.user_id = auth.uid()
        and m.role = 'owner'
    )
  );

create policy "memberships: owner만 삭제" on memberships
  for delete using (
    exists (
      select 1 from memberships m
      where m.space_id = memberships.space_id
        and m.user_id = auth.uid()
        and m.role = 'owner'
    )
  );

-- ─── items 정책 ───────────────────────────────────────────────────────────────
-- 공용 냉장고 특성상 익명 등록 허용

create policy "items: 누구나 조회" on items
  for select using (true);

create policy "items: 누구나 등록" on items
  for insert with check (true);

create policy "items: 본인 또는 admin 수정" on items
  for update using (
    owner_id = auth.uid()
    or exists (
      select 1 from memberships m
      join fridges f on f.space_id = m.space_id
      where f.id = items.fridge_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
    )
  );

create policy "items: 본인 또는 admin 삭제" on items
  for delete using (
    owner_id = auth.uid()
    or exists (
      select 1 from memberships m
      join fridges f on f.space_id = m.space_id
      where f.id = items.fridge_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
    )
  );

-- ─── item_logs 정책 ───────────────────────────────────────────────────────────

create policy "item_logs: 누구나 조회" on item_logs
  for select using (true);

create policy "item_logs: 누구나 기록" on item_logs
  for insert with check (true);

-- ─── Profiles ─────────────────────────────────────────────────────────────────

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles_select" on profiles for select using (true);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── Fridges location migration ───────────────────────────────────────────────

alter table fridges add column if not exists location text;

-- ─── Push Tokens ──────────────────────────────────────────────────────────────

create table if not exists push_tokens (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  token      text not null,
  updated_at timestamptz not null default now()
);

alter table push_tokens enable row level security;

create policy "push_tokens: 본인 관리" on push_tokens
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Reports ──────────────────────────────────────────────────────────────────

create table if not exists reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('post', 'comment')),
  target_id   uuid not null,
  fridge_id   uuid not null,
  reason      text not null,
  status      text not null check (status in ('pending', 'resolved', 'dismissed')) default 'pending',
  created_at  timestamptz not null default now()
);

alter table reports enable row level security;

-- 신고자는 본인 신고 삽입 가능
create policy "reports: 인증 사용자 삽입" on reports
  for insert with check (auth.uid() is not null and reporter_id = auth.uid());

-- 냉장고 admin/owner만 조회 가능
create policy "reports: admin/owner 조회" on reports
  for select using (
    exists (
      select 1 from memberships m
      where m.fridge_id = reports.fridge_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
    )
  );

-- 냉장고 admin/owner만 상태 업데이트 가능
create policy "reports: admin/owner 상태 변경" on reports
  for update using (
    exists (
      select 1 from memberships m
      where m.fridge_id = reports.fridge_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
    )
  );
