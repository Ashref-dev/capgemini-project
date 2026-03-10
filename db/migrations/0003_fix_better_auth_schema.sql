CREATE TABLE IF NOT EXISTS "user" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false,
  "image" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" text PRIMARY KEY NOT NULL,
  "expiresAt" timestamp NOT NULL,
  "token" text NOT NULL UNIQUE,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  "ipAddress" text,
  "userAgent" text,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" text PRIMARY KEY NOT NULL,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamp,
  "refreshTokenExpiresAt" timestamp,
  "scope" text,
  "password" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" text PRIMARY KEY NOT NULL,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expiresAt" timestamp NOT NULL,
  "createdAt" timestamp,
  "updatedAt" timestamp
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user' AND column_name = 'email_verified') THEN
    EXECUTE 'ALTER TABLE "user" RENAME COLUMN "email_verified" TO "emailVerified"';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user' AND column_name = 'created_at') THEN
    EXECUTE 'ALTER TABLE "user" RENAME COLUMN "created_at" TO "createdAt"';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user' AND column_name = 'updated_at') THEN
    EXECUTE 'ALTER TABLE "user" RENAME COLUMN "updated_at" TO "updatedAt"';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'session' AND column_name = 'expires_at') THEN
    EXECUTE 'ALTER TABLE "session" RENAME COLUMN "expires_at" TO "expiresAt"';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'session' AND column_name = 'created_at') THEN
    EXECUTE 'ALTER TABLE "session" RENAME COLUMN "created_at" TO "createdAt"';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'session' AND column_name = 'updated_at') THEN
    EXECUTE 'ALTER TABLE "session" RENAME COLUMN "updated_at" TO "updatedAt"';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'session' AND column_name = 'ip_address') THEN
    EXECUTE 'ALTER TABLE "session" RENAME COLUMN "ip_address" TO "ipAddress"';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'session' AND column_name = 'user_agent') THEN
    EXECUTE 'ALTER TABLE "session" RENAME COLUMN "user_agent" TO "userAgent"';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'session' AND column_name = 'user_id') THEN
    EXECUTE 'ALTER TABLE "session" RENAME COLUMN "user_id" TO "userId"';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'account' AND column_name = 'account_id') THEN
    EXECUTE 'ALTER TABLE "account" RENAME COLUMN "account_id" TO "accountId"';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'account' AND column_name = 'provider_id') THEN
    EXECUTE 'ALTER TABLE "account" RENAME COLUMN "provider_id" TO "providerId"';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'account' AND column_name = 'user_id') THEN
    EXECUTE 'ALTER TABLE "account" RENAME COLUMN "user_id" TO "userId"';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'account' AND column_name = 'access_token') THEN
    EXECUTE 'ALTER TABLE "account" RENAME COLUMN "access_token" TO "accessToken"';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'account' AND column_name = 'refresh_token') THEN
    EXECUTE 'ALTER TABLE "account" RENAME COLUMN "refresh_token" TO "refreshToken"';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'account' AND column_name = 'id_token') THEN
    EXECUTE 'ALTER TABLE "account" RENAME COLUMN "id_token" TO "idToken"';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'account' AND column_name = 'access_token_expires_at') THEN
    EXECUTE 'ALTER TABLE "account" RENAME COLUMN "access_token_expires_at" TO "accessTokenExpiresAt"';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'account' AND column_name = 'refresh_token_expires_at') THEN
    EXECUTE 'ALTER TABLE "account" RENAME COLUMN "refresh_token_expires_at" TO "refreshTokenExpiresAt"';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'account' AND column_name = 'created_at') THEN
    EXECUTE 'ALTER TABLE "account" RENAME COLUMN "created_at" TO "createdAt"';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'account' AND column_name = 'updated_at') THEN
    EXECUTE 'ALTER TABLE "account" RENAME COLUMN "updated_at" TO "updatedAt"';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'verification' AND column_name = 'expires_at') THEN
    EXECUTE 'ALTER TABLE "verification" RENAME COLUMN "expires_at" TO "expiresAt"';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'verification' AND column_name = 'created_at') THEN
    EXECUTE 'ALTER TABLE "verification" RENAME COLUMN "created_at" TO "createdAt"';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'verification' AND column_name = 'updated_at') THEN
    EXECUTE 'ALTER TABLE "verification" RENAME COLUMN "updated_at" TO "updatedAt"';
  END IF;
END $$;