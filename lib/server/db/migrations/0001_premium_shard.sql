DROP TABLE IF EXISTS "verification_tokens" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
ALTER TABLE "capgemini_employees" ADD COLUMN IF NOT EXISTS "password_hash" text;
ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "password_hash" text;