-- Run this once in the Supabase SQL editor.
create table if not exists public.holdem_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.holdem_saves enable row level security;
create policy "holdem save read own" on public.holdem_saves for select to authenticated using ((select auth.uid()) = user_id);
create policy "holdem save insert own" on public.holdem_saves for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "holdem save update own" on public.holdem_saves for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Realtime private-channel authorization.
create policy "holdem room broadcast read" on realtime.messages for select to authenticated using (
  realtime.messages.extension = 'broadcast' and (select realtime.topic()) like 'holdem-room:%'
);
create policy "holdem room broadcast write" on realtime.messages for insert to authenticated with check (
  realtime.messages.extension = 'broadcast' and (select realtime.topic()) like 'holdem-room:%'
);
create policy "holdem room presence read" on realtime.messages for select to authenticated using (
  realtime.messages.extension = 'presence' and (select realtime.topic()) like 'holdem-room:%'
);
create policy "holdem room presence write" on realtime.messages for insert to authenticated with check (
  realtime.messages.extension = 'presence' and (select realtime.topic()) like 'holdem-room:%'
);
create policy "holdem own private broadcast read" on realtime.messages for select to authenticated using (
  realtime.messages.extension = 'broadcast'
  and (select realtime.topic()) like 'holdem-private:%'
  and split_part((select realtime.topic()), ':', 3) = (select auth.uid()::text)
);
create policy "holdem private broadcast write" on realtime.messages for insert to authenticated with check (
  realtime.messages.extension = 'broadcast'
  and (select realtime.topic()) like 'holdem-private:%'
);