-- Resolves the TODO in 0001_init.sql: Vārtā entries are seeker-submitted,
-- published immediately (no moderation gate yet — admin moderation tooling
-- remains a fast-follow per the build brief). `created_by` tracks the
-- submitter so moderation can be added later without a schema change.

alter table varta_posts
  add column created_by uuid references profiles (id) on delete set null;

create policy "varta_posts: authenticated can insert own" on varta_posts
  for insert with check (auth.uid() = created_by);
