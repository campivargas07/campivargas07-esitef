#!/usr/bin/env bash
# Restaura Postgres + schema + datos demo tras reiniciar Codespace.
set -euo pipefail
cd "$(dirname "$0")/.."

export DATABASE_URL="${DATABASE_URL:-postgresql://esitef:esitef@localhost:5433/esitef}"

echo "→ Postgres Docker"
docker compose up -d

echo "→ Schema Drizzle"
npm run db:push

echo "→ Seed demo"
npm run seed

echo ""
echo "Listo. Inicia la app con: npm run dev"
echo "  http://localhost:3000"
echo "  demo@esitef.com / demo1234"
