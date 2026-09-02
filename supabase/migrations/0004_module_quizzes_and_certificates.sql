-- Module quizzes (one per learning module) and the completion certificate
-- unlocked once a seeker has passed all of them. Mirrors the era_responses
-- pattern: self-reported, owner-scoped, no admin/moderation involved.

create table module_quiz_progress (
  id uuid primary key default gen_random_uuid(),
  seeker_id uuid not null references profiles (id) on delete cascade,
  module_id text not null,
  passed boolean not null default false,
  best_score integer not null default 0,
  attempts integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (seeker_id, module_id)
);

create table certificates (
  id uuid primary key default gen_random_uuid(),
  seeker_id uuid not null references profiles (id) on delete cascade unique,
  name text not null,
  issued_at timestamptz not null default now()
);

create index module_quiz_progress_seeker_id_idx on module_quiz_progress (seeker_id);

alter table module_quiz_progress enable row level security;
alter table certificates enable row level security;

create policy "module_quiz_progress: owner can select" on module_quiz_progress
  for select using (auth.uid() = seeker_id);

create policy "module_quiz_progress: owner can insert" on module_quiz_progress
  for insert with check (auth.uid() = seeker_id);

create policy "module_quiz_progress: owner can update" on module_quiz_progress
  for update using (auth.uid() = seeker_id);

create policy "certificates: owner can select" on certificates
  for select using (auth.uid() = seeker_id);

create policy "certificates: owner can insert" on certificates
  for insert with check (auth.uid() = seeker_id);

create policy "certificates: owner can update" on certificates
  for update using (auth.uid() = seeker_id);
