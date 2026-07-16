# Checklist go-live — 2026-07-16T05:35:00.000Z

## Automático (local / pre-corte)
- [x] ETL delta + reconcile (PASSED) — ver `DELTA-LATEST.md`
- [x] Dump producción fresco (`data/staging/esitef-online.sql.gz`, 53M)
- [x] Build Next.js OK
- [x] Smoke Vercel preview PASSED (`campivargas07-esitef-rho.vercel.app`)
- [x] Vercel proyecto conectado a `main` (auto-deploy)

## Pendiente antes de DNS (Fase 0)
- [ ] `NEON_DATABASE_URL` en Codespace + `npm run go-live:neon-delta`
- [ ] Variables Vercel Production: `AUTH_URL`, Stripe **live** + webhook
- [ ] `WP_AUTH_BRIDGE_SECRET` coincidente con SiteGround
- [ ] PayPal live (`PAYPAL_*`) para presenciales reserva/completo
- [ ] Resend: dominio verificado → `RESEND_API_KEY` + `MAIL_FROM` en Vercel

## Manual (ventana T-0)
1. [ ] Backup verificable de MySQL WordPress + wp-content/uploads
2. [ ] WordPress/Tutor en modo solo lectura
3. [ ] Ejecutar ETL extract + load delta (Neon producción)
4. [ ] Ejecutar reconcile — sin issues bloqueantes
5. [ ] Webhooks Stripe/PayPal de producción activos
6. [ ] DNS apuntando a Next.js
7. [ ] Puente auth WordPress activo (2–4 semanas)
8. [ ] Monitoreo Sentry + alertas webhooks fallidos
9. [ ] Plan de rollback documentado

Comandos: `npm run go-live:window` · `npm run go-live:preflight`

Ver `docs/cutover/CUTOVER-RUNBOOK.md` y `SITEGROUND-CUTOVER-PASO-A-PASO.md`.
