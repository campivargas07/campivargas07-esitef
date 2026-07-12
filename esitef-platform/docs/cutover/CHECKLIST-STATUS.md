# Checklist go-live — 2026-07-12T20:19:56.260Z

## Automático (local)
- [x] ETL delta + reconcile (PASSED)

## Manual (producción)
1. [ ] Backup verificable de MySQL WordPress + wp-content/uploads
2. [ ] WordPress/Tutor en modo solo lectura
3. [ ] Ejecutar ETL extract + load delta
4. [ ] Ejecutar reconcile — sin issues bloqueantes
5. [ ] Webhooks Stripe/PayPal de producción activos
6. [ ] DNS apuntando a Next.js
7. [ ] Puente auth WordPress activo (2–4 semanas)
8. [ ] Monitoreo Sentry + alertas webhooks fallidos
9. [ ] Plan de rollback documentado

Ver `docs/cutover/CUTOVER-RUNBOOK.md` para el procedimiento completo.
