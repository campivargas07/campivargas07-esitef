# Fase 0 — checklist Vercel Production

Marca cada ítem en **Vercel → Project → Settings → Environment Variables → Production** (y Preview para pruebas).

## Obligatorias

| Variable | Valor | Verificación |
|----------|-------|--------------|
| `DATABASE_URL` | URL Neon (`?sslmode=require`) | Preview carga sin error 500 |
| `AUTH_SECRET` | `openssl rand -base64 32` | Login no falla con sesión inválida |
| `AUTH_URL` | `https://campivargas07-esitef-rho.vercel.app` (preview) → luego `https://esitef.com` | Callback OAuth correcto |
| `AUTH_TRUST_HOST` | `true` | Requerido en Vercel |
| `WP_AUTH_BRIDGE_URL` | `https://esitef.com/online/wp-json/esitef/v1/verify-password` | POST devuelve 401/400, no 404 |
| `WP_AUTH_BRIDGE_SECRET` | **Idéntico** a `ESITEF_AUTH_BRIDGE_SECRET` en `wp-config.php` SiteGround | Login con usuario WP real |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Checkout crea sesión |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` del endpoint live | Webhook 200 en Stripe Dashboard |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | — |

## Pagos presenciales + email

| Variable | Valor |
|----------|-------|
| `PAYPAL_CLIENT_ID` | Live app PayPal |
| `PAYPAL_CLIENT_SECRET` | Live |
| `PAYPAL_MODE` | `live` |
| `PAYPAL_WEBHOOK_ID` | Opcional; `/gracias` captura sin webhook |
| `RESEND_API_KEY` | `re_...` (dominio verificado) |
| `MAIL_FROM` | `ESITEF <noreply@esitef.com>` |

## Webhooks (Stripe Dashboard)

- URL: `https://<tu-dominio-vercel>/api/webhooks/stripe`
- Eventos: `checkout.session.completed`, `invoice.paid`, `checkout.session.expired`, `charge.refunded`

## Tras guardar variables

1. **Deployments → ⋯ → Redeploy** (sin cache si cambió `DATABASE_URL`)
2. `SMOKE_BASE_URL=https://campivargas07-esitef-rho.vercel.app npm run go-live:preflight`
3. Login manual con usuario WP real en preview

## Neon (Codespace)

```bash
cd esitef-platform
# Crear .env.neon desde .env.neon.example con tu URL Neon
npm run go-live:neon-delta   # reconcile PASSED obligatorio
```

## WP bridge (SiteGround)

En `wp-config.php` de producción, antes de `/* That's all */`:

```php
define( 'ESITEF_AUTH_BRIDGE_SECRET', 'tu-secreto-compartido' );
```

Subir `esitef-minimal/deploy/mu-plugins/esitef-auth-bridge.php` si no está.
