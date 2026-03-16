create table if not exists public.pink_mate_results (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  session_id text not null,
  result text not null check (result in ('human_win', 'machine_win')),
  difficulty text not null,
  move_count integer not null default 0,
  user_agent text
);

alter table public.pink_mate_results enable row level security;

create policy "allow insert results"
on public.pink_mate_results
for insert
to anon
with check (true);

create policy "allow read results"
on public.pink_mate_results
for select
to anon
using (true);
