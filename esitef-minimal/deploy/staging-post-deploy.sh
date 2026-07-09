#!/usr/bin/env bash
# Tras subir el tema: seed productos presenciales + smoke checks en staging.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$(dirname "$0")/.env.deploy"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ Falta $ENV_FILE"
  exit 1
fi
# shellcheck disable=SC1090
source "$ENV_FILE"

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
fi

REMOTE_WP="${REMOTE_WP_PATH:-$(dirname "$(dirname "$(dirname "$REMOTE_THEME_PATH")")")}"
SEED="${REMOTE_WP}/wp-content/themes/esitef-minimal/deploy/seed-presencial-products.php"

echo "→ Seed productos presenciales en staging…"
"${SSH_CMD[@]}" "${SFTP_USER}@${SFTP_HOST}" "cd '${REMOTE_WP}' && wp eval-file '${SEED}'"

echo ""
echo "→ Verificar opción esitef_presencial_wc_products…"
"${SSH_CMD[@]}" "${SFTP_USER}@${SFTP_HOST}" "cd '${REMOTE_WP}' && wp option get esitef_presencial_wc_products --format=json | head -c 500"

echo ""
echo "✅ Post-deploy listo."
echo "   QA manual: ${STAGING_URL:-}/cart/ y ${STAGING_URL:-}/checkout/"
echo "   Ver deploy/QA-CHECKLIST.md"
