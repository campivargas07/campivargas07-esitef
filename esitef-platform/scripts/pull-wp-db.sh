#!/usr/bin/env bash
# Descarga dump MySQL de producción SiteGround → archivo local (sin usar disco en el servidor).
# Uso:
#   export SSH_KEY_PASSPHRASE='...'
#   ./scripts/pull-wp-db.sh
#   ./scripts/pull-wp-db.sh --import   # además importa al MariaDB Docker local
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_ENV="$ROOT/../esitef-minimal/deploy/.env.deploy"
OUT_DIR="$ROOT/data/staging"
OUT_FILE="${OUT_FILE:-$OUT_DIR/esitef-online.sql.gz}"
IMPORT=false

for arg in "$@"; do
  case "$arg" in
    --import) IMPORT=true ;;
    -h|--help)
      echo "Uso: SSH_KEY_PASSPHRASE=... $0 [--import]"
      echo "  WP_ROOT remoto por defecto: /home/customer/www/esitef.com/public_html/online"
      exit 0
      ;;
  esac
done

if [[ ! -f "$DEPLOY_ENV" ]]; then
  echo "❌ Falta $DEPLOY_ENV — ejecuta esitef-minimal/deploy/prepare-env.sh"
  exit 1
fi
# shellcheck disable=SC1090
source "$DEPLOY_ENV"

WP_ROOT_REMOTE="${WP_ROOT_REMOTE:-/home/customer/www/esitef.com/public_html/online}"
WP_CONFIG="$WP_ROOT_REMOTE/wp-config.php"

if [[ -z "${SSH_KEY_PASSPHRASE:-}" ]]; then
  echo "❌ Falta SSH_KEY_PASSPHRASE en el entorno (Codespace secret o export)"
  exit 1
fi

PORT="${SFTP_PORT:-18765}"
SSH_BASE=(ssh -p "$PORT" -o StrictHostKeyChecking=accept-new)
if [[ -n "${SSH_KEY_PATH:-}" && -f "$SSH_KEY_PATH" ]]; then
  SSH_BASE+=(-i "$SSH_KEY_PATH")
fi

ASKPASS_SCRIPT="$(mktemp)"
cat >"$ASKPASS_SCRIPT" <<'EOF'
#!/bin/sh
exec printf '%s' "$SSH_KEY_PASSPHRASE"
EOF
chmod 700 "$ASKPASS_SCRIPT"
trap 'rm -f "$ASKPASS_SCRIPT"' EXIT
export SSH_ASKPASS="$ASKPASS_SCRIPT" SSH_ASKPASS_REQUIRE=force DISPLAY=:0
SSH_CMD=(setsid "${SSH_BASE[@]}")

REMOTE="${SFTP_USER}@${SFTP_HOST}"
echo "→ Leyendo wp-config en $WP_CONFIG"

DB_VARS="$(setsid "${SSH_BASE[@]}" "$REMOTE" "grep \"define.*DB_\" '$WP_CONFIG' | grep -v '^[[:space:]]*//'")" || {
  echo "❌ No se pudo leer wp-config. Prueba otro WP_ROOT_REMOTE:"
  echo "   export WP_ROOT_REMOTE=/home/customer/www/TU_RUTA/public_html/online"
  exit 1
}

db_get() {
  echo "$DB_VARS" | grep "define.*$1" | head -1 | sed -E "s/.*,\s*['\"]([^'\"]+)['\"].*/\1/"
}

DB_NAME="$(db_get DB_NAME)"
DB_USER="$(db_get DB_USER)"
DB_PASS="$(db_get DB_PASSWORD)"
DB_HOST="$(db_get DB_HOST)"

if [[ -z "$DB_NAME" || -z "$DB_USER" || -z "$DB_PASS" ]]; then
  echo "❌ No se pudieron parsear credenciales MySQL desde wp-config"
  exit 1
fi

mkdir -p "$OUT_DIR"
echo "→ Dump MySQL ($DB_NAME @ $DB_HOST) → $OUT_FILE"
echo "  (el archivo se crea en Codespace, no en SiteGround)"

setsid "${SSH_BASE[@]}" "$REMOTE" \
  "mysqldump -h '$DB_HOST' -u'$DB_USER' -p'$DB_PASS' '$DB_NAME' --single-transaction --quick | gzip -c" \
  >"$OUT_FILE"

SIZE="$(du -h "$OUT_FILE" | cut -f1)"
echo "✅ Dump guardado: $OUT_FILE ($SIZE)"

if [[ "$IMPORT" != true ]]; then
  echo ""
  echo "Siguiente paso — importar al Docker local y ETL:"
  echo "  $0 --import"
  echo "  # o manual:"
  echo "  cd $ROOT/../campivargas07-esitef && docker compose up -d db"
  echo "  gunzip -c '$OUT_FILE' | docker compose exec -T db mariadb -uwordpress -pwordpress wordpress"
  echo "  cd $ROOT && export DATABASE_URL=postgresql://esitef:esitef@localhost:5433/esitef"
  echo "  npm run cutover:delta"
  exit 0
fi

WP_COMPOSE="$ROOT/../docker-compose.yml"
echo "→ Importando en MariaDB Docker (:3307)..."
docker compose -f "$WP_COMPOSE" up -d db
echo "  Esperando MariaDB..."
sleep 5
gunzip -c "$OUT_FILE" | docker compose -f "$WP_COMPOSE" exec -T db \
  mariadb -uwordpress -pwordpress wordpress

echo "→ ETL cutover:delta..."
cd "$ROOT"
export DATABASE_URL="${DATABASE_URL:-postgresql://esitef:esitef@localhost:5433/esitef}"
npm run cutover:delta

echo "✅ Base importada y ETL completado."
