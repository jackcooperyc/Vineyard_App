#!/usr/bin/env bash
# Sync schema and seed data against the production database.
#
# Vercel does not expose sensitive env vars to `vercel env pull` or `vercel env run`,
# so copy DATABASE_URL from Vercel → Project → Settings → Environment Variables.
#
# Usage:
#   DATABASE_URL='postgres://...' ./scripts/sync-production-db.sh

set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Error: DATABASE_URL is not set."
  echo "Copy it from the Vercel dashboard (cev-app → Settings → Environment Variables)."
  exit 1
fi

export DIRECT_URL="${DIRECT_URL:-$DATABASE_URL}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Avoid local .env overriding production credentials
if [[ -f .env ]]; then
  mv .env .env.sync-backup
  trap 'mv .env.sync-backup .env' EXIT
fi

npx tsx scripts/migrate-task-types.ts
npx prisma db push
npx tsx scripts/migrate-task-blocks.ts
npm run db:seed

echo "Production database synced."
