-- LifeVerse realtime sync (Supabase)
-- Run this once in Supabase SQL Editor after creating a free project.
create table if not exists public.lifeverse_family_state (
  family_id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.lifeverse_family_state enable row level security;

-- Prototype family sync policy. Before public launch, replace this with authenticated family membership policies.
drop policy if exists "lifeverse prototype read" on public.lifeverse_family_state;
drop policy if exists "lifeverse prototype insert" on public.lifeverse_family_state;
drop policy if exists "lifeverse prototype update" on public.lifeverse_family_state;
create policy "lifeverse prototype read" on public.lifeverse_family_state for select to anon using (true);
create policy "lifeverse prototype insert" on public.lifeverse_family_state for insert to anon with check (true);
create policy "lifeverse prototype update" on public.lifeverse_family_state for update to anon using (true) with check (true);

-- Enable this table in Database > Replication / Realtime if it is not enabled automatically.
