#!/usr/bin/env bash
# Genera .env.deploy (sin secretos) desde variables de entorno, Codespace secrets o .env.deploy previo.
set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$DEPLOY_DIR/.env.deploy"
KEY_CANDIDATES=(
  "${SSH_KEY_PATH:-}"
  "$DEPLOY_DIR/.ssh/siteground_esitef"
  "$DEPLOY_DIR/.ssh/id_rsa"
  "$HOME/.ssh/siteground_esitef"
)

read_env_var() {
  local key="$1"
  local line
  [[ -f "$ENV_FILE" ]] || return 1
  line="$(grep -E "^${key}=" "$ENV_FILE" 2>/dev/null | tail -n1 || true)"
  [[ -n "$line" ]] || return 1
  printf '%s' "${line#*=}"
}

SFTP_HOST="${SFTP_HOST:-$(read_env_var SFTP_HOST || echo ssh.esitef.com)}"
SFTP_PORT="${SFTP_PORT:-$(read_env_var SFTP_PORT || echo 18765)}"
SFTP_USER="${SFTP_USER:-$(read_env_var SFTP_USER || true)}"
REMOTE_THEME_PATH="${REMOTE_THEME_PATH:-$(read_env_var REMOTE_THEME_PATH || echo /home/customer/www/staging3.esitef.com/public_html/online/wp-content/themes/esitef-minimal)}"
STAGING_URL="${STAGING_URL:-$(read_env_var STAGING_URL || echo https://staging3.esitef.com/online)}"
WP_ADMIN_URL="${WP_ADMIN_URL:-$(read_env_var WP_ADMIN_URL || echo https://staging3.esitef.com/online/wp-admin)}"

KEY_PATH=""
for candidate in "${KEY_CANDIDATES[@]}"; do
  [[ -n "$candidate" && -f "$candidate" ]] || continue
  KEY_PATH="$candidate"
  break
done

if [[ -z "$SFTP_USER" ]]; then
  echo "❌ Falta SFTP_USER"
  echo "   Codespace secret SFTP_USER o: export SFTP_USER=u1234-xxxxx"
  exit 1
fi

if [[ -z "$KEY_PATH" ]]; then
  echo "❌ Falta clave SSH. Copia la clave a:"
  echo "   $DEPLOY_DIR/.ssh/siteground_esitef"
  echo "   chmod 600 $DEPLOY_DIR/.ssh/siteground_esitef"
  exit 1
fi

chmod 600 "$KEY_PATH" 2>/dev/null || true

cat >"$ENV_FILE" <<EOF
# Generado por prepare-env.sh — NO commitear
# Secretos (SSH_KEY_PASSPHRASE, etc.) → Codespace secrets o export en sesión, NUNCA aquí.
SFTP_HOST=$SFTP_HOST
SFTP_PORT=$SFTP_PORT
SFTP_USER=$SFTP_USER
SSH_KEY_PATH=$KEY_PATH
REMOTE_THEME_PATH=$REMOTE_THEME_PATH
STAGING_URL=$STAGING_URL
WP_ADMIN_URL=$WP_ADMIN_URL
EOF

echo "✅ $ENV_FILE creado (sin passphrase en disco)"
echo "   Host: $SFTP_HOST:$SFTP_PORT"
echo "   User: $SFTP_USER"
echo "   Key:  $KEY_PATH"
if [[ -z "${SSH_KEY_PASSPHRASE:-}" ]]; then
  echo "   ⚠️  Falta SSH_KEY_PASSPHRASE en el entorno (Codespace secret o export)"
fi
