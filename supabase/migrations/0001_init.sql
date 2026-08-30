-- Echonflow initial schema
-- Run in Supabase SQL editor, or via `supabase db push` with the Supabase CLI.

create extension if not exists "pgcrypto";

create type user_role as enum ('provider', 'seeker');

create type provider_category as enum (
  'Resort',
  'Trainer',
  'Therapist / Practitioner',
  'Studio',
  'Retreat Center',
  'Nutritionist'
);

create type varta_type as enum ('reel', 'insight');

-- profiles: one row per auth user, created automatically on sign-up (see trigger below)
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  role user_role not null,
  created_at timestamptz not null default now()
);

create table listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles (id) on delete cascade,
  business_name text not null,
  category provider_category not null,
  location text not null,
  description text,
  price_range text,
  created_at timestamptz not null default now()
);

create table varta_posts (
  id uuid primary key default gen_random_uuid(),
  type varta_type not null,
  category text not null,
  title text not null,
  blurb text,
  instagram_id text,
  curator text,
  created_at timestamptz not null default now()
);

create table era_responses (
  id uuid primary key default gen_random_uuid(),
  seeker_id uuid not null references profiles (id) on delete cascade,
  answers jsonb not null,
  score integer,
  created_at timestamptz not null default now()
);

create table retreat_leads (
  id uuid primary key default gen_random_uuid(),
  seeker_id uuid references profiles (id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  message text,
  created_at timestamptz not null default now()
);

create index listings_owner_id_idx on listings (owner_id);
create index listings_category_idx on listings (category);
create index era_responses_seeker_id_idx on era_responses (seeker_id);
create index retreat_leads_seeker_id_idx on retreat_leads (seeker_id);

-- Auto-create a profile row when a new auth user signs up.
-- Expects `name` and `role` in the sign-up call's options.data (see src/lib/supabase auth calls).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    new.email,
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'seeker')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security --------------------------------------------------------

alter table profiles enable row level security;
alter table listings enable row level security;
alter table varta_posts enable row level security;
alter table era_responses enable row level security;
alter table retreat_leads enable row level security;

-- profiles: a user can only read/update their own profile
create policy "profiles: owner can select" on profiles
  for select using (auth.uid() = id);

create policy "profiles: owner can insert" on profiles
  for insert with check (auth.uid() = id);

create policy "profiles: owner can update" on profiles
  for update using (auth.uid() = id);

-- listings: readable by everyone (directory), writable only by the owning provider
create policy "listings: public can select" on listings
  for select using (true);

create policy "listings: provider can insert own" on listings
  for insert with check (
    auth.uid() = owner_id
    and exists (select 1 from profiles where id = auth.uid() and role = 'provider')
  );

create policy "listings: owner can update own" on listings
  for update using (auth.uid() = owner_id);

create policy "listings: owner can delete own" on listings
  for delete using (auth.uid() = owner_id);

-- varta_posts: readable by everyone. No public write policy yet —
-- TODO: once the real Vārtā "Add entry" flow is wired in, decide whether
-- entries are seeker-submitted (add an insert policy scoped to auth.uid())
-- or curator/admin-only (keep write access to the service role only).
create policy "varta_posts: public can select" on varta_posts
  for select using (true);

-- era_responses: a seeker can only see/insert their own audit responses
create policy "era_responses: owner can select" on era_responses
  for select using (auth.uid() = seeker_id);

create policy "era_responses: owner can insert" on era_responses
  for insert with check (auth.uid() = seeker_id);

-- retreat_leads: anyone (including signed-out visitors, for a future public
-- lead-capture form) can create a lead; a signed-in seeker can see their own.
create policy "retreat_leads: owner can select" on retreat_leads
  for select using (auth.uid() = seeker_id);

create policy "retreat_leads: anyone can insert" on retreat_leads
  for insert with check (true);
