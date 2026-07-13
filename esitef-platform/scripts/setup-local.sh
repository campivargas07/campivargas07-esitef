#!/usr/bin/env bash
# Restaura Postgres + schema + datos demo tras reiniciar Codespace.
# Usuarios reales WP: requiere MariaDB en :3307 (docker compose en raíz del repo).
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT_REPO="$(cd .. && pwd)"

export DATABASE_URL="${DATABASE_URL:-postgresql://esitef:esitef@localhost:5433/esitef}"

echo "→ Postgres Docker"
docker compose up -d

echo "→ Schema Drizzle"
npm run db:push

echo "→ Seed demo"
npm run seed

if docker compose -f "$ROOT_REPO/docker-compose.yml" ps db 2>/dev/null | grep -q "Up"; then
  echo "→ ETL usuarios reales (MariaDB :3307 → Postgres)"
  export WP_MYSQL_HOST=127.0.0.1
  export WP_MYSQL_PORT=3307
  export WP_MYSQL_USER=wordpress
  export WP_MYSQL_PASSWORD=wordpress
  export WP_MYSQL_DATABASE=wordpress
  export WP_TABLE_PREFIX=yrc_
  npm run cutover:delta
else
  echo "→ Usuarios reales omitidos (sin MariaDB WP)"
  echo "  Para login con cuentas de producción:"
  echo "    cd $ROOT_REPO && docker compose up -d db"
  echo "    cd esitef-platform && npm run cutover:delta"
fi

echo ""
echo "Listo. Inicia la app con: npm run dev"
echo "  http://localhost:3000"
echo "  Demo: demo@esitef.com / demo1234"
echo "  Reales: mismo email y contraseña que en esitef.com/online"
