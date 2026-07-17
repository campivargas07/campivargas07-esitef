# Go-live — ejecución ESITEF Online → Next.js

> Ventana de corte. Actualizado **2026-07-17**.

> **Guía detallada SiteGround (paso a paso, con explicaciones):** [`SITEGROUND-CUTOVER-PASO-A-PASO.md`](./SITEGROUND-CUTOVER-PASO-A-PASO.md)

## Estado actual

| Elemento | Valor |
|----------|-------|
| App producción | https://app.esitef.com |
| Alias Vercel | https://campivargas07-esitef-rho.vercel.app |
| WP legacy | https://esitef.com/online (solo lectura + auth bridge) |
| Neon | `esitef-prod` — reconcile PASSED |

## Fase 0 — Infraestructura destino (antes del flip DNS)

> **Guía detallada (Vercel + Neon):** [`VERCEL-NEON-SETUP.md`](./VERCEL-NEON-SETUP.md)  
> **Checklist variables Vercel (Fase 0):** [`FASE0-VERCEL.md`](./FASE0-VERCEL.md)

- [x] **PostgreSQL producción** (Neon) con datos migrados — reconcile PASSED (`DELTA-LATEST.md`)
- [x] **Next.js en Vercel** — Root Directory: `esitef-platform/apps/web` · proyecto `campivargas07-esitef`
- [x] Variables en el host de producción:
  - `DATABASE_URL` (endpoint **directo** Neon, sin `-pooler`)
  - `AUTH_SECRET`, `AUTH_URL=https://app.esitef.com`, `AUTH_TRUST_HOST=true`
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (live)
  - `WP_AUTH_BRIDGE_URL=https://esitef.com/online/wp-json/esitef/v1/verify-password`
  - `WP_AUTH_BRIDGE_SECRET` (mismo valor que en `wp-config.php` de WP)
  - `PAYPAL_*` / `PAYPAL_MODE=live` — pendiente si se usan presenciales PayPal directo
  - `RESEND_API_KEY`, `MAIL_FROM` — dominio Resend verificado; confirmar keys en Vercel
- [x] Webhook Stripe live → `https://app.esitef.com/api/webhooks/stripe`
- [ ] Stripe live: **Settings → Payment methods → PayPal** activado para EUR (y USD si aplica)

## Fase 1 — Pre-corte (Codespace / local, T-24h)

```bash
cd esitef-platform
npm run build                    # debe pasar
npm run test:smoke               # con dev server o URL staging
export SSH_KEY_PASSPHRASE='...'
npm run pull:wp-db -- --import   # dump fresco prod → MariaDB :3307
export DATABASE_URL=postgresql://esitef:esitef@localhost:5433/esitef
export WP_TABLE_PREFIX=yrc_
npm run cutover:delta            # reconcile PASSED
npm run export:wp-redirects      # regenera wp-redirects.json
npm run export:formaciones
npm run export:presencial
git add apps/web/src/data/*.json && git commit -m "..." && git push
```

- [x] Build OK
- [x] Delta + reconcile PASSED (2026-07-17 — Neon; ver `DELTA-LATEST.md`)
- [x] Redirects exportados (~83 reglas en `wp-redirects.json`)
- [x] Deploy + smoke PASSED en `campivargas07-esitef-rho.vercel.app` y `app.esitef.com`

## Fase 2 — Backup (T-0, producción SiteGround)

- [x] Backup MySQL verificable — `npm run pull:wp-db` → `data/staging/esitef-online.sql.gz` (53M, 2026-07-17)
- [x] Backup `wp-content/uploads` — `backups/wp-uploads/` (~1.2 GB vía rsync SFTP)
- [x] Ventana de corte: 2026-07-17

## Fase 3 — WordPress solo lectura (T+0)

En `wp-config.php` de **producción** (`esitef.com/online`), antes de `/* That's all */`:

```php
define( 'ESITEF_CUTOVER_READONLY', true );
define( 'ESITEF_AUTH_BRIDGE_SECRET', '...' ); // si no está ya
```

- [x] Subidos `esitef-readonly.php` y `esitef-auth-bridge.php` vía SFTP (`upload-mu-plugins.sh`)
- [x] Verificado: POST carrito WC → **503** mantenimiento; `/wp-json/esitef/v1/verify-password` responde (401 sin secret)

## Fase 4 — Delta final → Postgres producción (T+15min)

Con túnel SSH a MySQL prod **o** dump importado en ventana:

```bash
export DATABASE_URL='postgresql://...'   # PRODUCCIÓN
export WP_MYSQL_HOST=127.0.0.1
export WP_MYSQL_PORT=3307              # o túnel :3306
export WP_TABLE_PREFIX=yrc_
npm run cutover:delta
```

- [x] Reconcile **PASSED** (Neon; dump 16-jul cargado; backup 17-jul guardado como respaldo)
- [x] Conteos: ~2717 users · 65 courses · 8917 lesson progress · 11449 enrollments

## Fase 5 — Deploy Next + DNS (T+30min)

- [x] Deploy producción Vercel con último commit
- [x] `AUTH_URL` = `https://app.esitef.com`
- [x] DNS: `app.esitef.com` CNAME → Vercel (`cname.vercel-dns.com` / alias Vercel)
- [x] Reglas 301: `wp-redirects.json` en `next.config.ts`; smoke redirects `/online/*` OK

## Fase 6 — Smoke producción (T+45min)

- [x] `/` y `/formaciones` cargan
- [x] Login usuario WP real
- [ ] Dashboard con cursos matriculados (validar con alumno real si hace falta)
- [ ] Player con progreso
- [x] Redirect `/online/masterclass` → `/formaciones/masterclass`
- [ ] Compra test Stripe live (monto mínimo) → matrícula — omitida a petición
- [ ] Inscripción presencial test → email confirmación (requiere Resend verificado)

## Email transaccional (Resend)

Cuando el dominio esté **Verified** en [resend.com/domains](https://resend.com/domains):

1. Copiar `RESEND_API_KEY` (API Keys en Resend).
2. En Vercel → Environment Variables (Production + Preview):
   - `RESEND_API_KEY` = `re_...`
   - `MAIL_FROM` = `ESITEF <noreply@esitef.com>` (debe usar el dominio verificado)
3. Redeploy.
4. Pago presencial sandbox/live de prueba → comprobar inbox + en DB `orders.metadata.confirmationEmailSentAt`.
5. Sin `RESEND_API_KEY` el servidor solo loguea `[mail:dev]` (no falla el checkout).

TTL DNS en el registrador: el valor por defecto (3600 s) es correcto; la propagación suele tardar **5–30 min**, a veces hasta 48 h.

## Rollback

1. Revertir DNS de `app.esitef.com` (quitar CNAME Vercel)
2. Quitar `ESITEF_CUTOVER_READONLY` de `wp-config.php`
3. Desactivar webhooks live en Stripe si hubo problemas
4. No borrar Postgres (respaldo)

## Post-go-live (semanas 1–4)

- Puente auth WP activo
- Monitoreo webhooks diario
- Sprint diseño (hubs, paridad visual) + geo-moneda + checkout LATAM
- Retirar puente cuando >95% usuarios activos hayan iniciado sesión en Next
