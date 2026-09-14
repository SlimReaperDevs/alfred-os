-- BUG-1 — public.users had no foreign key to auth.users.
--
-- Deleting an auth account therefore left its app row behind. Because
-- public.users.email is `unique not null`, that orphan permanently blocked the
-- address from being reused: completeOnboardingAction upserts keyed on the NEW
-- auth id, hits the unique email constraint, and the user is bounced back to
-- /onboarding with no visible error.
--
-- Also drops the `gen_random_uuid()` default on id. That default was never
-- correct — id must always BE the auth user id (the RLS policy is
-- `auth.uid() = id`), so a row created with a random id would be invisible to
-- its own owner.
--
-- Safe to re-run.

begin;

-- 1. Clear orphans: app rows with no matching auth account.
--    Cascades to tracks, activity_log, settings and resources.
delete from public.users u
where not exists (
  select 1 from auth.users a where a.id = u.id
);

-- 2. id must come from auth, never be generated here.
alter table public.users alter column id drop default;

-- 3. Tie the app row's lifecycle to the auth account.
alter table public.users drop constraint if exists users_id_fkey;

alter table public.users
  add constraint users_id_fkey
  foreign key (id) references auth.users(id) on delete cascade;

commit;

-- Verify: expect fk_exists = true, default_gone = true, orphans = 0.
select
  (select count(*) from pg_constraint
     where conname = 'users_id_fkey' and conrelid = 'public.users'::regclass) = 1
    as fk_exists,
  (select column_default is null from information_schema.columns
     where table_schema = 'public' and table_name = 'users' and column_name = 'id')
    as default_gone,
  (select count(*) from public.users u
     where not exists (select 1 from auth.users a where a.id = u.id))
    as orphans;
