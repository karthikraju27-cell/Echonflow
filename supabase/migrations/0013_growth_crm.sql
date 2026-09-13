-- Echonflow Growth CRM: one private pipeline for every business relationship.
-- Review before running against the live project.
begin;

create table public.crm_leads (
  id uuid primary key default gen_random_uuid(),
  lead_type text not null
    check (lead_type in ('provider', 'community', 'corporate', 'partnership')),
  lead_name text not null
    check (char_length(btrim(lead_name)) between 1 and 140),
  organization text check (char_length(organization) <= 140),
  contact_name text check (char_length(contact_name) <= 100),
  email text check (char_length(email) <= 254),
  phone text check (char_length(phone) <= 30),
  city text check (char_length(city) <= 120),
  source text check (char_length(source) <= 120),
  provider_category text
    check (provider_category is null or provider_category in (
      'Resort', 'Trainer', 'Therapist / Practitioner',
      'Studio', 'Retreat Center', 'Nutritionist'
    )),
  offering text check (char_length(offering) <= 240),
  session_package smallint check (session_package between 1 and 52),
  estimated_value numeric(12,2) check (estimated_value >= 0),
  stage text not null default 'new'
    check (stage in (
      'new', 'contacted', 'qualified', 'proposal',
      'won', 'delivery', 'paused', 'lost'
    )),
  last_contact_on date,
  next_follow_up_on date,
  next_action text check (char_length(next_action) <= 240),
  notes text check (char_length(notes) <= 3000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crm_leads_provider_category_required check (
    lead_type <> 'provider' or provider_category is not null
  )
);

create index crm_leads_type_stage_due_idx
  on public.crm_leads(lead_type, stage, next_follow_up_on);
create index crm_leads_due_idx
  on public.crm_leads(next_follow_up_on)
  where stage not in ('won', 'delivery', 'lost');

alter table public.crm_leads enable row level security;
revoke all on public.crm_leads from anon, authenticated;

-- Preserve every record from the earlier provider-only recruitment tracker.
-- That legacy table remains untouched for rollback safety, but the app moves
-- all future work to crm_leads after this migration.
insert into public.crm_leads (
  id, lead_type, lead_name, organization, contact_name, email, phone, city,
  source, provider_category, stage, last_contact_on, next_follow_up_on,
  notes, created_at, updated_at
)
select
  id,
  'provider',
  provider_name,
  organization,
  contact_name,
  email,
  phone,
  city,
  source,
  category,
  case stage
    when 'prospect' then 'new'
    when 'contacted' then 'contacted'
    when 'interested' then 'qualified'
    when 'onboarding' then 'proposal'
    when 'live' then 'won'
    when 'paused' then 'paused'
    when 'declined' then 'lost'
  end,
  last_contact_on,
  next_follow_up_on,
  notes,
  created_at,
  updated_at
from public.provider_prospects
on conflict (id) do nothing;

commit;
