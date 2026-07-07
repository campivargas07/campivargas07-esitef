#!/usr/bin/env bash
# Atajo desde la raíz del repo — deploy a staging SiteGround
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
DEPLOY="$ROOT/esitef-minimal/deploy"

if [[ ! -f "$DEPLOY/.env.deploy" ]]; then
  "$DEPLOY/prepare-env.sh"
fi

if [[ -z "${SSH_KEY_PASSPHRASE:-}" ]]; then
  echo "❌ Falta SSH_KEY_PASSPHRASE (no va en .env.deploy)"
  echo ""
  echo "   Codespace (recomendado):"
  echo "   GitHub → Settings → Codespaces → Secrets → New secret"
  echo "   Nombre: SSH_KEY_PASSPHRASE → reinicia el Codespace"
  echo ""
  echo "   Sesión actual:"
  echo "   export SSH_KEY_PASSPHRASE='tu-passphrase'"
  exit 1
fi

exec "$DEPLOY/upload-theme.sh" "$@"
