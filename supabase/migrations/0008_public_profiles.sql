-- Seeker public profiles (opt-in, off by default). Only name + certificates
-- are ever shown publicly — never era_responses, under any circumstance,
-- opted in or not. That's a hard rule, not a default.
alter table profiles
  add column public_profile boolean not null default false;

-- The existing "profiles: owner can select" policy (0001) only lets a user
-- read their OWN row. A public profile page needs anyone to be able to
-- read a profile's name once that profile has opted in — without this,
-- public_profile=true would do nothing.
create policy "profiles: public can select public profiles" on profiles
  for select using (public_profile = true);

-- Same gap for certificates: without this, nobody but the owner could read
-- a certificate row, even for a seeker who has opted into a public profile.
create policy "certificates: public can select for public profiles" on certificates
  for select using (
    exists (
      select 1 from profiles
      where profiles.id = certificates.seeker_id and profiles.public_profile = true
    )
  );

-- Provider public profiles need no schema change — the existing
-- "listings: public can select" policy (0001) already allows anyone to
-- read a listing, and the existing insert policy on `leads` (named
-- "retreat_leads: anyone can insert" pre-rename, carried over by 0005)
-- already allows a signed-out visitor's inquiry with check (true).
