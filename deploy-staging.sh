#!/usr/bin/env bash
# Atajo desde la raíz del repo — deploy a staging SiteGround
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
DEPLOY="$ROOT/esitef-minimal/deploy"

if [[ ! -f "$DEPLOY/.env.deploy" ]]; then
  "$DEPLOY/prepare-env.sh"
fi

if [[ -n "${SSH_KEY_PASSPHRASE:-}" ]]; then
  echo "→ Usando SSH_KEY_PASSPHRASE del entorno (Codespace secret)"
elif [[ -f "$DEPLOY/.env.secrets" ]]; then
  # shellcheck disable=SC1091
  source "$DEPLOY/.env.secrets"
  if [[ -n "${SSH_KEY_PASSPHRASE:-}" ]]; then
    export SSH_KEY_PASSPHRASE
    echo "→ Usando SSH_KEY_PASSPHRASE desde deploy/.env.secrets"
  fi
fi

if [[ -z "${SSH_KEY_PASSPHRASE:-}" ]]; then
  read -r -s -p "Passphrase de la clave SSH SiteGround: " SSH_KEY_PASSPHRASE
  echo ""
  if [[ -z "${SSH_KEY_PASSPHRASE}" ]]; then
    echo "❌ Passphrase vacía"
    echo "   Configura el secret Codespace SSH_KEY_PASSPHRASE o crea deploy/.env.secrets"
    exit 1
  fi
  export SSH_KEY_PASSPHRASE
fi

exec "$DEPLOY/upload-theme.sh" "$@"
