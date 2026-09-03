-- Supports the real ERA content swap (gap #2) and provider matching by
-- weak audit section (gap #3).

-- era_responses only stored one overall score; add the per-section
-- breakdown so results/matching can use it without recomputing from raw
-- answers.
alter table era_responses
  add column section_scores jsonb;

-- Tag listings against the same 5 ERA section IDs (cognitive, somatic,
-- circadian, culture, environment) so audit results can link into a
-- pre-filtered slice of the directory. No DB-level constraint on the
-- values — the app's fixed section-id list is the source of truth here,
-- same pattern as provider_category.
alter table listings
  add column era_section_tags text[];

-- Lead status pipeline (gap #6): cheap now, and it's the data that
-- eventually proves the matching loop drives real bookings.
alter table leads
  add column status text not null default 'new';

alter table leads
  add constraint leads_status_check check (status in ('new', 'contacted', 'booked'));

-- Providers need to update status on leads tied to their own listings
-- (there was previously only a select policy for this).
create policy "leads: provider can update own listing leads" on leads
  for update using (
    listing_id is not null
    and exists (select 1 from listings where listings.id = leads.listing_id and listings.owner_id = auth.uid())
  );
