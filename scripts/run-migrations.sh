#!/bin/bash
set -e
# Wrapper that runs all migrations in correct order.
# Usage: DATABASE_URL=postgres://... bash scripts/run-migrations.sh

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL must be set"
  exit 1
fi

echo "[1/3] Enabling pgvector extension..."
psql "$DATABASE_URL" -f backend/db/migrations/0000_pgvector_init.sql

echo "[2/3] Running Drizzle migrations..."
bun run db:migrate

echo "[3/3] Adding HNSW index + partial unique index..."
psql "$DATABASE_URL" -f backend/db/migrations/0002_hnsw_and_partial_unique.sql

echo "✓ All migrations applied."
