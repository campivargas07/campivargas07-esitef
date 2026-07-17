# Checklist go-live — actualizado 2026-07-17

## Automático (local / pre-corte)
- [x] ETL delta + reconcile (PASSED) — ver `DELTA-LATEST.md` (Neon producción)
- [x] Dump producción fresco (`data/staging/esitef-online.sql.gz`, 53M — 2026-07-17)
- [x] Backup `wp-content/uploads` (`backups/wp-uploads/`, ~1.2 GB)
- [x] Build Next.js OK
- [x] Smoke Vercel PASSED (`campivargas07-esitef-rho.vercel.app` y `https://app.esitef.com`)
- [x] Vercel proyecto conectado a `main` (auto-deploy)
- [x] `go-live:preflight` PASSED (build + smoke preview)

## Fase 0 — Infra destino

| Ítem | Estado | Acción |
|------|--------|--------|
| Neon datos | Hecho | 2717 users, 65 courses, 8917 lesson progress, 11449 enrollments — reconcile PASSED |
| Neon seed | Hecho | `admin@esitef.com` / `demo@esitef.com` en Neon |
| `DATABASE_URL` en Vercel | Hecho | Endpoint **directo** Neon (sin `-pooler`) |
| `AUTH_URL` + `AUTH_TRUST_HOST=true` | Hecho | `AUTH_URL=https://app.esitef.com` |
| `AUTH_SECRET` producción | Hecho | Configurado en Vercel Production |
| Stripe **live** + webhook | Hecho | Endpoint `https://app.esitef.com/api/webhooks/stripe` |
| `WP_AUTH_BRIDGE_SECRET` | Hecho | Mismo valor en Vercel y `wp-config.php` SiteGround |
| PayPal **live** (`PAYPAL_*`) | Pendiente | Presenciales reserva/completo (opcional) |
| Resend (`RESEND_*`) | Parcial | Dominio verificado (registros DNS `send` / DKIM); confirmar keys en Vercel |

Guía detallada: [`FASE0-VERCEL.md`](./FASE0-VERCEL.md)

## Manual (ventana T-0)

1. [x] Backup verificable de MySQL WordPress + wp-content/uploads
2. [x] WordPress/Tutor en modo solo lectura (`ESITEF_CUTOVER_READONLY` + mu-plugins)
3. [x] ETL delta en Neon producción — reconcile PASSED (ver `DELTA-LATEST.md`)
4. [x] Reconcile — sin issues bloqueantes
5. [x] Webhook Stripe live activo (`https://app.esitef.com/api/webhooks/stripe`)
6. [x] DNS `app.esitef.com` → Vercel (CNAME)
7. [x] Puente auth WordPress activo (2–4 semanas)
8. [ ] Monitoreo Sentry + alertas webhooks fallidos
9. [x] Plan de rollback documentado (ver `GO-LIVE-EXECUTION.md` / `CUTOVER-RUNBOOK.md`)

## Dominio y smoke

- App producción: **https://app.esitef.com**
- Login usuario WP real: validado
- Smoke routes: PASSED (`/`, `/formaciones`, hubs, `/espana`, redirects `/online/*`)
- Compra Stripe live de prueba: omitida a petición (opcional post-corte)

Comandos: `npm run go-live:window` · `npm run go-live:preflight` · `npm run go-live:neon-delta`

Ver `docs/cutover/CUTOVER-RUNBOOK.md` y `SITEGROUND-CUTOVER-PASO-A-PASO.md`.
