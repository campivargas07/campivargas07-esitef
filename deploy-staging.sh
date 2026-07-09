#!/usr/bin/env bash
# Atajo desde la raíz del repo — deploy a staging SiteGround
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
DEPLOY="$ROOT/esitef-minimal/deploy"

if [[ ! -f "$DEPLOY/.env.deploy" ]]; then
  "$DEPLOY/prepare-env.sh"
fi

if [[ -z "${SSH_KEY_PASSPHRASE:-}" ]]; then
  read -r -s -p "Passphrase de la clave SSH SiteGround: " SSH_KEY_PASSPHRASE
  echo ""
  if [[ -z "${SSH_KEY_PASSPHRASE}" ]]; then
    echo "❌ Passphrase vacía"
    exit 1
  fi
  export SSH_KEY_PASSPHRASE
fi

exec "$DEPLOY/upload-theme.sh" "$@"
