-- Custom SQL migration file, put your code below! --

-- Normalize legacy emails to lowercase. Better Auth always looks up users by
-- lower(email); legacy rows stored with the exact typed casing (e.g.
-- "Janusz@DeepMindfulness.io") would otherwise never be found, locking those
-- users out. The users_email_ci_unique index already guarantees no two rows
-- collide on lower(email), so this update is collision-safe.
UPDATE "users" SET "email" = lower("email") WHERE "email" <> lower("email");

-- Back-fill Better Auth credential accounts from the legacy `users.password`.
-- Each existing user gets one `account` row (providerId = 'credential') whose
-- `password` is the bcrypt hash copied verbatim — Better Auth's custom verify
-- normalizes $2y$ at read time, so hashes are never rewritten. accountId = the
-- user's id (Better Auth's convention for credential accounts), and the user id
-- is preserved so every foreign key (assessments, snapshots) stays intact.
--
-- Idempotent: re-running skips users that already have a credential account,
-- so this is safe to apply on a dev branch and again on production.
INSERT INTO "account" (
  "id", "account_id", "provider_id", "user_id", "password", "created_at", "updated_at"
)
SELECT
  gen_random_uuid()::text,
  u."id",
  'credential',
  u."id",
  u."password",
  u."created_at",
  u."updated_at"
FROM "users" u
WHERE NOT EXISTS (
  SELECT 1 FROM "account" a
  WHERE a."user_id" = u."id" AND a."provider_id" = 'credential'
);
