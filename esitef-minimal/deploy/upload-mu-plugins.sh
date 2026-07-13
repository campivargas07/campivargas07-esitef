#!/usr/bin/env bash
# Sube mu-plugins de corte (auth bridge + read-only) a WordPress SiteGround.
# Uso:
#   export SSH_KEY_PASSPHRASE='...'
#   export WP_ROOT_REMOTE=/home/customer/www/esitef.com/public_html/online   # prod
#   ./deploy/upload-mu-plugins.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$(dirname "$0")/.env.deploy"

if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
fi

WP_ROOT_REMOTE="${WP_ROOT_REMOTE:-/home/customer/www/esitef.com/public_html/online}"
REMOTE_MU="${WP_ROOT_REMOTE}/wp-content/mu-plugins"

if [[ -z "${SSH_KEY_PASSPHRASE:-}" && -n "${SSH_KEY_PATH:-}" && -f "$SSH_KEY_PATH" ]]; then
  echo "❌ Falta SSH_KEY_PASSPHRASE en el entorno"
  exit 1
fi

for var in SFTP_HOST SFTP_USER; do
  if [[ -z "${!var:-}" ]]; then
    echo "❌ Completa $var en .env.deploy"
    exit 1
  fi
done

PORT="${SFTP_PORT:-18765}"
SSH_CMD=(ssh -p "$PORT" -o StrictHostKeyChecking=accept-new)
if [[ -n "${SSH_KEY_PATH:-}" && -f "$SSH_KEY_PATH" ]]; then
  SSH_CMD+=(-i "$SSH_KEY_PATH")
  ASKPASS_SCRIPT="$(mktemp)"
  cat >"$ASKPASS_SCRIPT" <<'EOF'
#!/bin/sh
exec printf '%s' "$SSH_KEY_PASSPHRASE"
EOF
  chmod 700 "$ASKPASS_SCRIPT"
  trap 'rm -f "$ASKPASS_SCRIPT"' EXIT
  export SSH_ASKPASS="$ASKPASS_SCRIPT" SSH_ASKPASS_REQUIRE=force DISPLAY=:0
  SSH_CMD=(setsid "${SSH_CMD[@]}")
fi

REMOTE="${SFTP_USER}@${SFTP_HOST}"
echo "→ Subiendo mu-plugins a ${REMOTE}:${REMOTE_MU}"

setsid "${SSH_CMD[@]}" "$REMOTE" "mkdir -p '$REMOTE_MU'"

rsync -avz \
  -e "${SSH_CMD[*]}" \
  "$ROOT/deploy/mu-plugins/" "${REMOTE}:${REMOTE_MU}/"

echo "✅ mu-plugins sincronizados."
echo "   Activa en wp-config.php de producción:"
echo "     define( 'ESITEF_CUTOVER_READONLY', true );"
echo "     define( 'ESITEF_AUTH_BRIDGE_SECRET', '...' );"
