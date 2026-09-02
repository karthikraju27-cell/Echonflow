-- Provider hub + leads CRM.
--
-- retreat_leads becomes the general lead-capture table for any provider
-- listing (not just retreats), so it's renamed to `leads` and gains a
-- listing_id so a lead can be attributed to the provider who owns that
-- listing. Existing RLS policies (created on the old table name) carry
-- over automatically — Postgres policies follow the table, not its name.
alter table retreat_leads rename to leads;

alter table leads
  add column listing_id uuid references listings (id) on delete set null;

create index leads_listing_id_idx on leads (listing_id);

create policy "leads: provider can select own listing leads" on leads
  for select using (
    listing_id is not null
    and exists (select 1 from listings where listings.id = leads.listing_id and listings.owner_id = auth.uid())
  );

-- Provider sign-up now collects a phone number and a short description of
-- what service they offer.
alter table profiles
  add column phone text,
  add column service text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role, phone, service)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    new.email,
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'seeker'),
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'service'
  );
  return new;
end;
$$;
