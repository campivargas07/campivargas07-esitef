# Checklist go-live — actualizado 2026-07-16

## Automático (local / pre-corte)
- [x] ETL delta + reconcile (PASSED) — ver `DELTA-LATEST.md` (Postgres local)
- [x] Dump producción fresco (`data/staging/esitef-online.sql.gz`, 53M)
- [x] Build Next.js OK
- [x] Smoke Vercel preview PASSED (`campivargas07-esitef-rho.vercel.app`)
- [x] Vercel proyecto conectado a `main` (auto-deploy)
- [x] `go-live:preflight` PASSED (build + smoke preview)

## Fase 0 — Infra destino

| Ítem | Estado | Acción |
|------|--------|--------|
| Neon datos | Casi listo | 2719 users, 8916/8917 lesson progress. `npm run etl:load` en curso o re-ejecutar `go-live:neon-delta` |
| Neon seed | Hecho | `admin@esitef.com` / `demo@esitef.com` en Neon |
| `DATABASE_URL` en Vercel | Verificar | Debe coincidir con Neon |
| `AUTH_URL` + `AUTH_TRUST_HOST=true` | Pendiente | Ver [`FASE0-VERCEL.md`](./FASE0-VERCEL.md) |
| `AUTH_SECRET` producción | Pendiente | No usar el de dev |
| Stripe **live** + webhook | Pendiente | Dashboard Stripe → endpoint `/api/webhooks/stripe` |
| `WP_AUTH_BRIDGE_SECRET` | Pendiente | Mismo valor en Vercel y `wp-config.php` SiteGround |
| PayPal **live** (`PAYPAL_*`) | Pendiente | Presenciales reserva/completo |
| Resend (`RESEND_*`) | Pendiente | Dominio verificado en Resend |

Guía detallada: [`FASE0-VERCEL.md`](./FASE0-VERCEL.md)

## Manual (ventana T-0)

1. [ ] Backup verificable de MySQL WordPress + wp-content/uploads
2. [ ] WordPress/Tutor en modo solo lectura
3. [ ] Ejecutar ETL extract + load delta (Neon producción, dump fresco)
4. [ ] Ejecutar reconcile — sin issues bloqueantes
5. [ ] Webhooks Stripe/PayPal de producción activos
6. [ ] DNS apuntando a Next.js
7. [ ] Puente auth WordPress activo (2–4 semanas)
8. [ ] Monitoreo Sentry + alertas webhooks fallidos
9. [ ] Plan de rollback documentado

Comandos: `npm run go-live:window` · `npm run go-live:preflight` · `npm run go-live:neon-delta`

Ver `docs/cutover/CUTOVER-RUNBOOK.md` y `SITEGROUND-CUTOVER-PASO-A-PASO.md`.
