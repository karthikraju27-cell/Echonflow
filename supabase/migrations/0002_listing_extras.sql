-- Adds provider-facing booking/payment links and the WRS™ (Workation
-- Readiness Score) fields for Resort listings. Run after 0001_init.sql.
--
-- WRS™ is scoped to Resort listings only (score, tier, and a per-category
-- breakdown), self-reported by the provider via the assessment flow at
-- /provider/listings/[id]/wrs. See src/lib/wrs-questions.ts — the
-- category weights and tier cutoffs there are a placeholder methodology,
-- flagged for replacement with the real WRS™ rubric.

alter table listings
  add column payment_link text,
  add column wrs_score integer,
  add column wrs_tier text,
  add column wrs_breakdown jsonb;
