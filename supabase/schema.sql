-- Pitchfolio schema. Run in the Supabase SQL editor (or `supabase db push`).
--
-- Every table is scoped to auth.uid() via RLS, so one user can never read or
-- write another user's row — the policy is the only thing standing between
-- "my proposals" and "everyone's proposals", since the anon key is public by
-- design.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  headline text not null default '',
  bio text not null default '',
  stack text[] not null default '{}',
  avoid_scope text not null default '',
  -- Admins skip the /api/analyze rate limit (checkAnalyzeLimit in
  -- src/lib/rate-limit.ts). Locked to service_role-only writes below, so a
  -- user can never grant it to themselves through the anon/authenticated key.
  is_admin boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Safe to run even if profiles already existed from an earlier version of
-- this file (before stack/avoid_scope/is_admin existed): ADD COLUMN IF NOT
-- EXISTS converges the table to the current shape without touching rows
-- that already have these columns.
alter table public.profiles add column if not exists stack text[] not null default '{}';
alter table public.profiles add column if not exists avoid_scope text not null default '';
alter table public.profiles add column if not exists is_admin boolean not null default false;

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  context text not null default '',
  problem text not null default '',
  result text not null default '',
  stack text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_title text not null,
  job_post text not null default '',
  budget text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'replied', 'won', 'lost')),
  analysis jsonb,
  draft jsonb,
  sent_on date,
  created_at timestamptz not null default now()
);

-- Paragraphs worth reusing. A line that lands well ("here's how I handle
-- fixed-price scope") is worth keeping once rather than rewriting per proposal.
create table if not exists public.snippets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists proposals_user_id_idx on public.proposals (user_id);
create index if not exists cases_user_id_idx on public.cases (user_id);
create index if not exists snippets_user_id_idx on public.snippets (user_id);

alter table public.profiles enable row level security;
alter table public.cases enable row level security;
alter table public.proposals enable row level security;
alter table public.snippets enable row level security;

-- Each policy is "own rows only" — select/insert/update/delete all gated on
-- auth.uid() matching the row's owner column.

create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

create policy "cases: read own" on public.cases
  for select using (auth.uid() = user_id);
create policy "cases: insert own" on public.cases
  for insert with check (auth.uid() = user_id);
create policy "cases: update own" on public.cases
  for update using (auth.uid() = user_id);
create policy "cases: delete own" on public.cases
  for delete using (auth.uid() = user_id);

create policy "proposals: read own" on public.proposals
  for select using (auth.uid() = user_id);
create policy "proposals: insert own" on public.proposals
  for insert with check (auth.uid() = user_id);
create policy "proposals: update own" on public.proposals
  for update using (auth.uid() = user_id);
create policy "proposals: delete own" on public.proposals
  for delete using (auth.uid() = user_id);

create policy "snippets: read own" on public.snippets
  for select using (auth.uid() = user_id);
create policy "snippets: insert own" on public.snippets
  for insert with check (auth.uid() = user_id);
create policy "snippets: update own" on public.snippets
  for update using (auth.uid() = user_id);
create policy "snippets: delete own" on public.snippets
  for delete using (auth.uid() = user_id);

-- RLS only checks row ownership, not which columns changed — without this,
-- a user could open devtools and PATCH their own profiles row to set
-- is_admin = true directly through the anon key. This trigger silently
-- reverts is_admin to its previous value unless the write comes from
-- service_role (i.e. the Supabase SQL editor, or a server route using the
-- service key — never the browser).
create or replace function public.protect_is_admin()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.is_admin is distinct from old.is_admin and auth.role() <> 'service_role' then
    new.is_admin = old.is_admin;
  end if;
  return new;
end;
$$;

drop trigger if exists on_profiles_protect_is_admin on public.profiles;
create trigger on_profiles_protect_is_admin
  before update on public.profiles
  for each row execute function public.protect_is_admin();

-- New signups get an empty profile row automatically.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Tornar sua própria conta admin (acesso ilimitado a /api/analyze)
-- ---------------------------------------------------------------------------
-- Rode isto UMA VEZ no SQL Editor do painel Supabase (não pelo app — o SQL
-- Editor roda como service_role, então passa pelo trigger acima). Troque o
-- e-mail pelo que você usou no cadastro:
--
--   update public.profiles p
--   set is_admin = true
--   from auth.users u
--   where u.id = p.id and u.email = 'seu-email-aqui@exemplo.com';
