-- Provider onboarding. Review before running against the live project.
begin;

alter table public.listings
  add column offering_title text,
  add column offering_audience text,
  add column delivery_format text check (delivery_format in ('In person', 'Online', 'Online and in person')),
  add column qualifications text;

-- Keep business contact details OUT of publicly readable listings/profiles.
create table public.provider_onboarding_contacts (
  listing_id uuid primary key references public.listings(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  contact_name text not null check (char_length(btrim(contact_name)) between 1 and 100),
  email text not null check (char_length(email) between 3 and 254),
  phone text check (char_length(phone) <= 30),
  created_at timestamptz not null default now()
);
alter table public.provider_onboarding_contacts enable row level security;
revoke all on public.provider_onboarding_contacts from anon, authenticated;
grant select, insert on public.provider_onboarding_contacts to authenticated;
create policy "onboarding contacts: owner read"
  on public.provider_onboarding_contacts for select to authenticated
  using (owner_id = (select auth.uid()));
create policy "onboarding contacts: owner insert"
  on public.provider_onboarding_contacts for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (select 1 from public.listings l
      where l.id = listing_id and l.owner_id = (select auth.uid()))
  );

-- One transaction, owner derived from the session, idempotent retries.
create function public.publish_provider_onboarding(p_id uuid, p_draft jsonb)
returns uuid
language plpgsql security invoker set search_path = ''
as $$
declare
  v_owner uuid := auth.uid();
  v_id uuid;
  v_category public.provider_category;
begin
  if v_owner is null or not exists (
    select 1 from public.profiles where id = v_owner and role = 'provider'
  ) then raise exception 'Provider account required'; end if;

  if p_id is null or p_draft is null or jsonb_typeof(p_draft) <> 'object'
  then raise exception 'Invalid submission'; end if;

  if coalesce(char_length(btrim(p_draft->>'name')),0) not between 1 and 120
    or coalesce(char_length(btrim(p_draft->>'city')),0) not between 1 and 120
    or coalesce(char_length(btrim(p_draft->>'description')),0) not between 30 and 900
    or coalesce(char_length(btrim(p_draft->>'offer')),0) not between 1 and 140
    or coalesce(char_length(btrim(p_draft->>'audience')),0) not between 1 and 250
    or coalesce(char_length(btrim(p_draft->>'contact')),0) not between 1 and 100
    or coalesce(char_length(btrim(p_draft->>'email')),0) not between 3 and 254
    or coalesce(char_length(p_draft->>'phone'),0) > 30
    or coalesce(char_length(p_draft->>'price'),0) > 100
    or coalesce(char_length(p_draft->>'credentials'),0) > 500
    or coalesce(p_draft->>'format','') not in ('In person','Online','Online and in person')
    or coalesce(p_draft->>'email','') !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
  then raise exception 'Invalid provider details'; end if;

  v_category := (p_draft->>'category')::public.provider_category;
  if v_category is null then raise exception 'Category required'; end if;

  insert into public.listings (
    id, owner_id, business_name, category, location, description, price_range,
    offering_title, offering_audience, delivery_format, qualifications
  ) values (
    p_id, v_owner, btrim(p_draft->>'name'), v_category, btrim(p_draft->>'city'),
    btrim(p_draft->>'description'), nullif(btrim(p_draft->>'price'),''),
    btrim(p_draft->>'offer'), btrim(p_draft->>'audience'),
    case when v_category in ('Resort','Retreat Center') then 'In person' else p_draft->>'format' end,
    nullif(btrim(p_draft->>'credentials'),'')
  ) on conflict (id) do nothing returning id into v_id;

  if v_id is null then
    if exists (select 1 from public.listings where id = p_id and owner_id = v_owner)
    then return p_id;
    else raise exception 'Submission ID already used'; end if;
  end if;

  insert into public.provider_onboarding_contacts(listing_id,owner_id,contact_name,email,phone)
  values (p_id,v_owner,btrim(p_draft->>'contact'),btrim(p_draft->>'email'),nullif(btrim(p_draft->>'phone'),''));
  return p_id;
end;
$$;
revoke all on function public.publish_provider_onboarding(uuid,jsonb) from public, anon;
grant execute on function public.publish_provider_onboarding(uuid,jsonb) to authenticated;

commit;
