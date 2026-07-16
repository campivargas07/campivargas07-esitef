#!/usr/bin/env bash
# Ventana de corte T-0 — ejecutar manualmente en orden.
# NO activa readonly ni DNS automáticamente (pasos destructivos en producción).
set -euo pipefail

cat <<'EOF'
=== ESITEF Go-live — ventana de corte ===

Fase 2 — Backup (SiteGround)
  1. Site Tools → Backups → verificar MySQL + uploads
  2. O: npm run pull:wp-db  (guarda data/staging/esitef-online.sql.gz)

Fase 3 — WordPress solo lectura
  1. Subir esitef-minimal/deploy/mu-plugins/esitef-readonly.php
  2. Subir esitef-minimal/deploy/mu-plugins/esitef-auth-bridge.php
  3. wp-config.php: define('ESITEF_CUTOVER_READONLY', true);

Fase 4 — Delta final → Neon
  export NEON_DATABASE_URL='postgresql://...@neon...'
  npm run pull:wp-db -- --import   # dump de la ventana
  npm run go-live:neon-delta

Fase 5 — Deploy + DNS
  git push origin main             # Vercel auto-deploy
  Vercel → Domains → esitef.com (o subruta acordada)
  AUTH_URL = URL pública final

Fase 6 — Smoke producción
  SMOKE_BASE_URL=https://TU-DOMINIO npm run test:smoke
  Login WP real → dashboard → player → compra test Stripe live

Rollback: revertir DNS, quitar ESITEF_CUTOVER_READONLY, no borrar Neon.

Detalle: docs/cutover/SITEGROUND-CUTOVER-PASO-A-PASO.md
EOF
