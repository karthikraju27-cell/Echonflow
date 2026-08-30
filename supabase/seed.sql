-- Optional sample data for local/dev. Run after 0001_init.sql.
insert into varta_posts (type, category, title, blurb, instagram_id, curator) values
  ('insight', 'Sleep', 'Why your 11pm scroll is costing you REM', 'A short breakdown of blue light''s real effect on sleep architecture, not the exaggerated version.', null, 'Echonflow Editorial'),
  ('reel', 'Breathwork', 'A 4-minute box breathing reset', 'Good for between back-to-back calls.', 'CxxxxxxxxAB', 'Echonflow Editorial'),
  ('insight', 'Nutrition', 'The protein-timing myth, debunked', 'Total daily intake matters more than the 30-minute window everyone panics about.', null, 'Echonflow Editorial');
