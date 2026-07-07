#!/usr/bin/env bash
# Sincroniza esitef-minimal → staging SiteGround (rsync por SSH/SFTP)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$(dirname "$0")/.env.deploy"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ Falta $ENV_FILE"
  echo "   cp deploy/.env.deploy.example deploy/.env.deploy"
  exit 1
fi
# shellcheck disable=SC1090
source "$ENV_FILE"

# Passphrase solo desde entorno / Codespace secret — nunca desde .env.deploy
if grep -qE '^SSH_KEY_PASSPHRASE=' "$ENV_FILE" 2>/dev/null; then
  echo "⚠️  Quita SSH_KEY_PASSPHRASE de .env.deploy (usa Codespace secret o export)"
  echo "   ./esitef-minimal/deploy/prepare-env.sh"
  exit 1
fi

if [[ -z "${SSH_KEY_PASSPHRASE:-}" && -n "${SSH_KEY_PATH:-}" && -f "$SSH_KEY_PATH" ]]; then
  echo "❌ Falta SSH_KEY_PASSPHRASE en el entorno"
  echo "   export SSH_KEY_PASSPHRASE='...'  o secret Codespace SSH_KEY_PASSPHRASE"
  exit 1
fi

for var in SFTP_HOST SFTP_USER REMOTE_THEME_PATH; do
  if [[ -z "${!var:-}" || "${!var}" == CHANGE_ME* ]]; then
    echo "❌ Completa $var en .env.deploy"
    exit 1
  fi
done

PORT="${SFTP_PORT:-18765}"
SSH_CMD=(ssh -p "$PORT" -o StrictHostKeyChecking=accept-new)
if [[ -n "${SSH_KEY_PATH:-}" && -f "$SSH_KEY_PATH" ]]; then
  SSH_CMD+=(-i "$SSH_KEY_PATH")
  if [[ -n "${SSH_KEY_PASSPHRASE:-}" ]]; then
    export SSH_KEY_PASSPHRASE
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
elif [[ -n "${SFTP_PASSWORD:-}" ]]; then
  export SFTP_PASSWORD
  # ponytail: SSH_ASKPASS evita sshpass; requiere setsid sin TTY
  ASKPASS_SCRIPT="$(mktemp)"
  cat >"$ASKPASS_SCRIPT" <<'EOF'
#!/bin/sh
exec printf '%s' "$SFTP_PASSWORD"
EOF
  chmod 700 "$ASKPASS_SCRIPT"
  trap 'rm -f "$ASKPASS_SCRIPT"' EXIT
  export SSH_ASKPASS="$ASKPASS_SCRIPT" SSH_ASKPASS_REQUIRE=force DISPLAY=:0
  SSH_CMD=(setsid "${SSH_CMD[@]}")
fi

echo "→ Subiendo tema a ${SFTP_USER}@${SFTP_HOST}:${REMOTE_THEME_PATH}"
echo "  (puerto ${PORT})"

rsync -avz --delete \
  -e "${SSH_CMD[*]}" \
  --exclude 'deploy/.env.deploy' \
  --exclude 'deploy/.ssh/' \
  --exclude '.git' \
  --exclude '.DS_Store' \
  "$ROOT/" "${SFTP_USER}@${SFTP_HOST}:${REMOTE_THEME_PATH}/"

echo "✅ Tema sincronizado."
echo "   Staging: ${STAGING_URL:-https://staging3.esitef.com/online}"
echo "   Tip: vacía caché en Site Tools → Speed → Caching"
