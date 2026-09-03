-- Company/cohort tracking for enterprise pilots (starting with Krafton).
-- A company groups seekers so HR can see an aggregate wellness picture —
-- never individual answers, and only once enough people have responded
-- that no one person's results could be inferred (min_report_threshold).
create table companies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  min_report_threshold int not null default 5,
  created_at timestamptz not null default now()
);

insert into companies (slug, name) values ('krafton', 'Krafton');

alter table profiles
  add column company_id uuid references companies (id) on delete set null;

-- Denormalized onto era_responses too (not just joined through profiles)
-- so a pilot's results stay attributable even if a seeker's profile
-- company_id changes later.
alter table era_responses
  add column company_id uuid references companies (id) on delete set null;

create index profiles_company_id_idx on profiles (company_id);
create index era_responses_company_id_idx on era_responses (company_id);

alter table companies enable row level security;

-- Readable by anyone — needed to validate a ?org= slug at signup/audit
-- time, before the visitor has an account.
create policy "companies: public can select" on companies
  for select using (true);

-- No new policy on the company_id columns themselves: the existing
-- owner-only select/insert/update policies on profiles and era_responses
-- (0001) already cover them end to end. The aggregate pilot report at
-- /admin/reports/[slug] reads across every seeker in a company via the
-- service-role client (bypasses RLS) — never client-side RLS.

-- Stamp company_id on signup from raw_user_meta_data, same as name/role.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role, company_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    new.email,
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'seeker'),
    (new.raw_user_meta_data ->> 'company_id')::uuid
  );
  return new;
end;
$$;
