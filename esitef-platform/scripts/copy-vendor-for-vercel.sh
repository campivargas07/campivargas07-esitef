#!/usr/bin/env bash
# ponytail: npm workspaces hoist next al root; Vercel runtime busca en apps/web/node_modules
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB_MODULES="$ROOT/apps/web/node_modules"
ROOT_MODULES="$ROOT/node_modules"

copy_pkg() {
  local name="$1"
  if [[ ! -d "$ROOT_MODULES/$name" ]]; then
    echo "copy-vendor: skip $name (not in root node_modules)"
    return 0
  fi
  mkdir -p "$WEB_MODULES"
  rm -rf "$WEB_MODULES/$name"
  cp -a "$ROOT_MODULES/$name" "$WEB_MODULES/$name"
  echo "copy-vendor: $name -> apps/web/node_modules/"
}

for pkg in next react react-dom; do
  copy_pkg "$pkg"
done
