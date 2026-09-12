-- Separate provider recruitment from seeker inquiries.
-- Review before running against the live project.
begin;

-- Providers can close inquiries that are not a fit, without treating them
-- as booked. Existing new/contacted/booked values remain unchanged.
alter table public.leads drop constraint if exists leads_status_check;
alter table public.leads add constraint leads_status_check
  check (status in ('new', 'contacted', 'booked', 'closed'));

-- Private notes and follow-up dates live outside `leads` because seekers can
-- read their own lead rows. These details are visible only to the provider
-- who owns the associated listing.
create table public.lead_followups (
  lead_id uuid primary key references public.leads(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  notes text check (char_length(notes) <= 2000),
  next_follow_up_at timestamptz,
  last_contact_at timestamptz,
  updated_at timestamptz not null default now()
);

create index lead_followups_owner_due_idx
  on public.lead_followups(owner_id, next_follow_up_at);

alter table public.lead_followups enable row level security;
revoke all on public.lead_followups from anon, authenticated;
grant select, insert, update on public.lead_followups to authenticated;

create policy "lead followups: provider can select own"
  on public.lead_followups for select to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.listings l
      where l.id = listing_id and l.owner_id = (select auth.uid())
    )
  );

create policy "lead followups: provider can insert own"
  on public.lead_followups for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1
      from public.leads lead
      join public.listings l on l.id = lead.listing_id
      where lead.id = lead_id
        and lead.listing_id = listing_id
        and l.owner_id = (select auth.uid())
    )
  );

create policy "lead followups: provider can update own"
  on public.lead_followups for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1
      from public.leads lead
      join public.listings l on l.id = lead.listing_id
      where lead.id = lead_id
        and lead.listing_id = listing_id
        and l.owner_id = (select auth.uid())
    )
  );

-- One authenticated call updates the public inquiry status and the private
-- follow-up record atomically. Ownership comes from auth.uid(), never input.
create or replace function public.update_provider_lead(
  p_lead_id uuid,
  p_status text,
  p_notes text,
  p_next_follow_up_at timestamptz,
  p_mark_contacted boolean default false
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_owner uuid := auth.uid();
  v_listing uuid;
begin
  if v_owner is null then raise exception 'Provider account required'; end if;
  if p_status not in ('new', 'contacted', 'booked', 'closed')
    or coalesce(char_length(p_notes), 0) > 2000
  then raise exception 'Invalid lead update'; end if;

  select lead.listing_id into v_listing
  from public.leads lead
  join public.listings l on l.id = lead.listing_id
  where lead.id = p_lead_id and l.owner_id = v_owner;

  if v_listing is null then raise exception 'Lead not found'; end if;

  update public.leads set status = p_status where id = p_lead_id;
  insert into public.lead_followups (
    lead_id, listing_id, owner_id, notes, next_follow_up_at,
    last_contact_at, updated_at
  ) values (
    p_lead_id, v_listing, v_owner, nullif(btrim(p_notes), ''),
    p_next_follow_up_at,
    case when p_mark_contacted then now() else null end,
    now()
  )
  on conflict (lead_id) do update set
    notes = excluded.notes,
    next_follow_up_at = excluded.next_follow_up_at,
    last_contact_at = case
      when p_mark_contacted then now()
      else public.lead_followups.last_contact_at
    end,
    updated_at = now();
end;
$$;

revoke all on function public.update_provider_lead(uuid,text,text,timestamptz,boolean)
  from public, anon;
grant execute on function public.update_provider_lead(uuid,text,text,timestamptz,boolean)
  to authenticated;

-- Echonflow's own supply-side recruitment tracker. It has no client-facing
-- policies and is read/written only through the service role after the
-- ADMIN_REPORT_SECRET gate is checked by the server.
create table public.provider_prospects (
  id uuid primary key default gen_random_uuid(),
  provider_name text not null check (char_length(btrim(provider_name)) between 1 and 140),
  category text not null check (category in ('Resort','Trainer','Therapist / Practitioner','Studio','Retreat Center','Nutritionist')),
  organization text check (char_length(organization) <= 140),
  contact_name text check (char_length(contact_name) <= 100),
  email text check (char_length(email) <= 254),
  phone text check (char_length(phone) <= 30),
  city text check (char_length(city) <= 120),
  source text check (char_length(source) <= 120),
  stage text not null default 'prospect'
    check (stage in ('prospect','contacted','interested','onboarding','live','paused','declined')),
  last_contact_on date,
  next_follow_up_on date,
  notes text check (char_length(notes) <= 3000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index provider_prospects_stage_due_idx
  on public.provider_prospects(stage, next_follow_up_on);

alter table public.provider_prospects enable row level security;
revoke all on public.provider_prospects from anon, authenticated;

commit;
