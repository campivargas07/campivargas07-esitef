#!/usr/bin/env bash
# ponytail: post-build only — Vercel runtime busca next en apps/web/node_modules
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB_MODULES="$ROOT/apps/web/node_modules"
ROOT_MODULES="$ROOT/node_modules"

copy_pkg() {
  local name="$1"
  [[ -d "$ROOT_MODULES/$name" ]] || return 0
  mkdir -p "$WEB_MODULES"
  rm -rf "$WEB_MODULES/$name"
  cp -a "$ROOT_MODULES/$name" "$WEB_MODULES/$name"
  echo "copy-vendor: $name -> apps/web/node_modules/"
}

for pkg in next react react-dom; do
  copy_pkg "$pkg"
done
