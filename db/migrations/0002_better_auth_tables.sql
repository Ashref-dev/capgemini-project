-- Tables requises par Better Auth v1.4+
-- Appliqué via : bun run db:migrate

CREATE TABLE IF NOT EXISTS "user" (
  "id"             text PRIMARY KEY NOT NULL,
  "name"           text NOT NULL,
  "email"          text NOT NULL UNIQUE,
  "emailVerified"  boolean NOT NULL DEFAULT false,
  "image"          text,
  "createdAt"      timestamp NOT NULL DEFAULT now(),
  "updatedAt"      timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "session" (
  "id"          text PRIMARY KEY NOT NULL,
  "expiresAt"   timestamp NOT NULL,
  "token"       text NOT NULL UNIQUE,
  "createdAt"   timestamp NOT NULL DEFAULT now(),
  "updatedAt"   timestamp NOT NULL DEFAULT now(),
  "ipAddress"   text,
  "userAgent"   text,
  "userId"      text NOT NULL REFERENCES "user"("id") ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS "account" (
  "id"                       text PRIMARY KEY NOT NULL,
  "accountId"                text NOT NULL,
  "providerId"               text NOT NULL,
  "userId"                   text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
  "accessToken"              text,
  "refreshToken"             text,
  "idToken"                  text,
  "accessTokenExpiresAt"     timestamp,
  "refreshTokenExpiresAt"    timestamp,
  "scope"                    text,
  "password"                 text,
  "createdAt"                timestamp NOT NULL DEFAULT now(),
  "updatedAt"                timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id"          text PRIMARY KEY NOT NULL,
  "identifier"  text NOT NULL,
  "value"       text NOT NULL,
  "expiresAt"   timestamp NOT NULL,
  "createdAt"   timestamp,
  "updatedAt"   timestamp
);
