#!/usr/bin/env bash
# ETL delta contra Postgres producción (Neon) + usuarios demo/admin.
# Requiere dump WP importado en MariaDB :3307 (npm run pull:wp-db -- --import).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Opcional: esitef-platform/.env.neon con DATABASE_URL=postgresql://...@neon...
# ponytail: no usar `source` — & y # en la URL rompen bash
if [[ -f "$ROOT/.env.neon" ]]; then
  _neon_line="$(grep -E '^(DATABASE_URL|NEON_DATABASE_URL)=' "$ROOT/.env.neon" | grep -v '^[[:space:]]*#' | tail -1 || true)"
  if [[ -n "$_neon_line" ]]; then
    _neon_val="${_neon_line#*=}"
    _neon_val="${_neon_val%\"}"
    _neon_val="${_neon_val#\"}"
    _neon_val="${_neon_val%\'}"
    _neon_val="${_neon_val#\'}"
    export NEON_DATABASE_URL="$_neon_val"
  fi
  unset _neon_line _neon_val
fi

if [[ -z "${NEON_DATABASE_URL:-}" ]]; then
  echo "❌ Falta NEON_DATABASE_URL"
  echo ""
  echo "Opción A — export en terminal:"
  echo "  export NEON_DATABASE_URL='postgresql://...@ep-....neon.tech/...?sslmode=require'"
  echo ""
  echo "Opción B — archivo $ROOT/.env.neon (gitignored):"
  echo "  DATABASE_URL=postgresql://...@ep-....neon.tech/...?sslmode=require"
  echo ""
  echo "Copia la URL desde Vercel → Settings → Environment Variables → DATABASE_URL"
  echo "o desde Neon → Connect."
  exit 1
fi

export DATABASE_URL="$NEON_DATABASE_URL"
export WP_TABLE_PREFIX="${WP_TABLE_PREFIX:-yrc_}"

echo "→ db:push contra Neon (sincroniza lesson_notes y tablas nuevas)…"
# ponytail: drift en Neon existente puede fallar db:push; el ETL sigue si el schema ya está.
if ! npm run db:push; then
  echo "⚠ db:push falló (schema drift en Neon). Continuando con cutover:delta…"
fi

echo "→ cutover:delta contra Neon (2718+ usuarios WP)…"
npm run cutover:delta

echo "→ seed admin + demo (idempotente)…"
npm run seed

echo ""
echo "✅ Neon listo. En Vercel verifica también:"
echo "  AUTH_URL=https://campivargas07-esitef-rho.vercel.app"
echo "  AUTH_TRUST_HOST=true"
echo "  WP_AUTH_BRIDGE_URL=https://esitef.com/online/wp-json/esitef/v1/verify-password"
echo "  WP_AUTH_BRIDGE_SECRET=<mismo valor que wp-config.php en SiteGround>"
echo ""
echo "Luego Redeploy en Vercel → Deployments → ⋯ → Redeploy"
