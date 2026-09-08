-- Reporting floor: ten distinct employee accounts, not ten submissions.
-- Existing stricter thresholds are preserved.
alter table public.companies alter column min_report_threshold set default 10;
update public.companies
set min_report_threshold = 10
where min_report_threshold < 10;
alter table public.companies
add constraint companies_min_report_threshold_floor check (min_report_threshold >= 10);
