#!/usr/bin/env bash
# ETL delta contra Postgres producción (Neon).
# Requiere dump WP importado en MariaDB :3307 (npm run pull:wp-db -- --import).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -z "${NEON_DATABASE_URL:-}" ]]; then
  echo "❌ Falta NEON_DATABASE_URL (postgresql://...@ep-....neon.tech/...?sslmode=require)"
  echo "   Copia la connection string desde Neon → Connect."
  exit 1
fi

export DATABASE_URL="$NEON_DATABASE_URL"
export WP_TABLE_PREFIX="${WP_TABLE_PREFIX:-yrc_}"

echo "→ db:push contra Neon…"
npm run db:push

echo "→ cutover:delta contra Neon…"
npm run cutover:delta

echo "✅ Delta Neon completado — ver docs/cutover/DELTA-LATEST.md"
