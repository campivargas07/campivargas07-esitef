# Ensayo de corte — ESITEF Platform

## Checklist previo al corte

1. [ ] Backup verificable de MySQL WordPress + wp-content/uploads
2. [ ] WordPress/Tutor en modo solo lectura
3. [ ] Ejecutar `npm run etl:extract` + `npm run etl:load` (delta)
4. [ ] Ejecutar `npm run etl:reconcile` — sin issues bloqueantes
5. [ ] Webhooks Stripe/PayPal de producción activos
6. [ ] DNS apuntando a Next.js
7. [ ] Puente auth WordPress activo (2–4 semanas)
8. [ ] Monitoreo Sentry + alertas webhooks fallidos
9. [ ] Plan de rollback documentado

## Delta en producción

El comando \`npm run cutover:delta\` ejecuta extract → load → reconcile contra la **fuente MySQL configurada**.

### Opción A — WP local Docker (ensayo)
\`\`\`bash
cd /workspaces/campivargas07-esitef
docker compose up -d
cd esitef-platform
export DATABASE_URL=postgresql://esitef:esitef@localhost:5433/esitef
npm run cutover:delta
\`\`\`

### Opción B — MySQL de producción (corte real)
1. Backup verificable de MySQL + uploads
2. Poner WordPress en **solo lectura**
3. Túnel SSH al MySQL de producción o importar dump en el Docker local
4. Variables en \`.env\` o entorno:
   \`\`\`bash
   export DATABASE_URL=postgresql://...   # Postgres destino (staging/prod)
   export WP_MYSQL_HOST=127.0.0.1       # vía túnel
   export WP_MYSQL_PORT=3306
   export WP_MYSQL_USER=...
   export WP_MYSQL_PASSWORD=...
   export WP_MYSQL_DATABASE=...
   export WP_TABLE_PREFIX=yrc_
   \`\`\`
5. Si usas túnel en lugar de Docker WP, adaptar \`packages/etl/src/extract.ts\` o importar dump al MariaDB local
6. \`npm run cutover:delta\` — debe terminar con reconcile **PASSED**
7. \`npm run export:wp-redirects\` — redirects 301 desde plugin Redirection (\`yrc_redirection_items\`) + rutas Tutor bajo \`/online\`
8. \`npm run cutover:checklist\`

Último delta local: ver \`docs/cutover/DELTA-LATEST.md\`.

## Comandos

```bash
cd esitef-platform
npm run cutover:rehearse   # audit + extract + load + reconcile
npm run cutover:delta      # solo importación delta
npm run cutover:checklist  # imprimir checklist
```

## Rollback

1. Restaurar DNS a WordPress
2. Quitar modo solo lectura
3. Desactivar webhooks de producción en Stripe/PayPal
4. Mantener PostgreSQL como respaldo (no borrar hasta validación)

## Post-corte (semanas 1–4)

- Monitorear accesos, pagos, webhooks diariamente
- Retirar puente de contraseñas cuando >95% usuarios activos hayan iniciado sesión
- Archivar WordPress tras backup final y retención legal
