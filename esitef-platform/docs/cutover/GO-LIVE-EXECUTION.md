# Go-live — ejecución ESITEF Online → Next.js

> Ventana de corte. Marca cada paso al completarlo.

> **Guía detallada SiteGround (paso a paso, con explicaciones):** [`SITEGROUND-CUTOVER-PASO-A-PASO.md`](./SITEGROUND-CUTOVER-PASO-A-PASO.md)

## Fase 0 — Infraestructura destino (antes del flip DNS)

> **Guía detallada (Vercel + Neon):** [`VERCEL-NEON-SETUP.md`](./VERCEL-NEON-SETUP.md)

- [ ] **PostgreSQL producción** (Neon) con `DATABASE_URL` anotada — ejecutar `npm run go-live:neon-delta` con `NEON_DATABASE_URL`
- [x] **Next.js en Vercel** — Root Directory: `esitef-platform/apps/web` · proyecto `campivargas07-esitef` · https://campivargas07-esitef-rho.vercel.app
- [ ] Variables en el host de producción:
  - `DATABASE_URL`
  - `AUTH_SECRET`, `AUTH_URL=https://esitef.com` (o subdominio final)
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (live)
  - `WP_AUTH_BRIDGE_URL=https://esitef.com/online/wp-json/esitef/v1/verify-password`
  - `WP_AUTH_BRIDGE_SECRET` (mismo valor que en `wp-config.php` de WP)
  - `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE=live` (presenciales reserva/completo)
  - `RESEND_API_KEY`, `MAIL_FROM=ESITEF <noreply@esitef.com>` — **tras verificar dominio en Resend** (ver abajo)
- [ ] Webhook Stripe live → `https://<dominio-next>/api/webhooks/stripe`
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
- [x] Delta + reconcile PASSED (2026-07-16, 2718 usuarios, dump prod 53M)
- [x] Redirects exportados (79 reglas) — pendiente commit/push
- [x] Deploy preview probado — smoke PASSED en `campivargas07-esitef-rho.vercel.app`

## Fase 2 — Backup (T-0, producción SiteGround)

- [ ] Backup MySQL verificable (Site Tools → Backups o `pull-wp-db` guardado)
- [ ] Backup / snapshot `wp-content/uploads`
- [ ] Anotar hora de inicio de ventana

## Fase 3 — WordPress solo lectura (T+0)

En `wp-config.php` de **producción** (`esitef.com/online`), antes de `/* That's all */`:

```php
define( 'ESITEF_CUTOVER_READONLY', true );
define( 'ESITEF_AUTH_BRIDGE_SECRET', '...' ); // si no está ya
```

- [ ] Subir `deploy/mu-plugins/esitef-readonly.php` y `esitef-auth-bridge.php` vía SFTP
- [ ] Verificar: compra WC bloqueada; login y `/wp-json/esitef/v1/verify-password` funcionan

## Fase 4 — Delta final → Postgres producción (T+15min)

Con túnel SSH a MySQL prod **o** dump importado en ventana:

```bash
export DATABASE_URL='postgresql://...'   # PRODUCCIÓN
export WP_MYSQL_HOST=127.0.0.1
export WP_MYSQL_PORT=3307              # o túnel :3306
export WP_TABLE_PREFIX=yrc_
npm run cutover:delta
```

- [ ] Reconcile **PASSED**
- [ ] Conteos usuarios/cursos coherentes con WP

## Fase 5 — Deploy Next + DNS (T+30min)

- [ ] Deploy producción (Vercel/host) con último commit
- [ ] `AUTH_URL` = URL pública final
- [ ] DNS: `esitef.com/online` o subdominio → app Next (según arquitectura elegida)
- [ ] Reglas 301: `wp-redirects.json` ya en `next.config.ts`; verificar `/online/*`

## Fase 6 — Smoke producción (T+45min)

- [ ] `/` y `/formaciones` cargan
- [ ] Login usuario WP real
- [ ] Dashboard con cursos matriculados
- [ ] Player con progreso
- [ ] Redirect `/online/masterclass` → `/formaciones/masterclass`
- [ ] Compra test Stripe live (monto mínimo) → matrícula
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


1. Revertir DNS a WordPress
2. Quitar `ESITEF_CUTOVER_READONLY` de `wp-config.php`
3. Desactivar webhooks live en Stripe si hubo problemas
4. No borrar Postgres (respaldo)

## Post-go-live (semanas 1–4)

- Puente auth WP activo
- Monitoreo webhooks diario
- Sprint dashboard + geo-moneda + checkout LATAM
