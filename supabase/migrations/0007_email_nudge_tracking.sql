-- Tracks whether a re-audit nudge email has already been sent for a given
-- era_responses row, so the daily cron job (see src/app/api/cron/re-audit-nudge)
-- doesn't re-notify the same seeker every day once they're in the 60-90 day
-- window.
alter table era_responses
  add column nudge_sent_at timestamptz;
