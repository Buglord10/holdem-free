-- Run this once in the Supabase SQL editor.
create table if not exists public.holdem_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.holdem_saves enable row level security;
create policy "users can read own holdem save" on public.holdem_saves for select to authenticated using ((select auth.uid()) = user_id);
create policy "users can insert own holdem save" on public.holdem_saves for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users can update own holdem save" on public.holdem_saves for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Realtime: the game uses private channels and requires authenticated clients.
create policy "holdem room read" on realtime.messages for select to authenticated using (
  realtime.messages.extension = 'broadcast' and (select realtime.topic()) like 'holdem-room:%'
);
create policy "holdem room write" on realtime.messages for insert to authenticated with check (
  realtime.messages.extension = 'broadcast' and (select realtime.topic()) like 'holdem-room:%'
);