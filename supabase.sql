-- Rode no Supabase: SQL Editor > New query > Run
create table public.finance_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.finance_data enable row level security;

create policy "cada usuario acessa so os proprios dados"
  on public.finance_data
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
