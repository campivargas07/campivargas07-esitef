# Cutover DNS — apex `esitef.com` → Vercel

Checklist manual para la ventana de corte. Código previo debe estar desplegado en Production.

## Antes del DNS (T-24h)

- [ ] `npm run test:cutover-smoke` OK contra `https://app.esitef.com`
- [ ] `npm run test:checkout-smoke` OK (Stripe webhook + matrícula demo)
- [ ] `npm run verify:legacy-passwords` OK
- [ ] `npm run db:migrate` en Neon producción (tabla `password_reset_tokens`)
- [ ] Email de prueba: `/ingresar/olvidar` → Resend entrega enlace
- [ ] Backup SiteGround: WP apex + `/online` + MySQL + `wp-content/uploads`
- [ ] Screenshot DNS Zone Editor actual (rollback)

## Vercel Domains

1. **Settings → Domains** → añadir `esitef.com` y `www.esitef.com`
2. Marcar `esitef.com` como **Primary**
3. `www` → redirect 308 a apex (Vercel lo ofrece al añadir ambos)
4. Copiar registro **A** / **TXT `_vercel`** que pida Vercel para el apex

## SiteGround DNS Zone Editor

| Registro | Acción |
|----------|--------|
| **A** apex `@` | → IP Vercel (`76.76.21.21` o la que indique el panel) |
| **CNAME** `www` | → `cname.vercel-dns.com` |
| **CNAME** `assets` | **No tocar** — CDN estático uploads |
| **MX** | **No tocar** — email |
| **TXT** SPF/DKIM/DMARC/BIMI Resend | **No tocar** |
| **CNAME** `app` | Mantener 2–4 semanas; luego opcional quitar |

## Variables Vercel (Production)

```bash
AUTH_URL=https://esitef.com
NEXT_PUBLIC_SITE_URL=https://esitef.com
WP_AUTH_BRIDGE_ENABLED=false
# Retirar o vaciar:
# WP_AUTH_BRIDGE_URL
# WP_AUTH_BRIDGE_SECRET
NEXT_PUBLIC_ASSETS_BASE_URL=https://assets.esitef.com
```

Redeploy Production tras cambiar env.

## Redirect `app.esitef.com` (después del flip DNS, no antes)

Cuando `esitef.com` ya apunte a Vercel, añade en `apps/web/vercel.json`:

```json
"redirects": [
  {
    "source": "/:path*",
    "has": [{ "type": "host", "value": "app.esitef.com" }],
    "destination": "https://esitef.com/:path*",
    "permanent": true
  }
]
```

**No** actives este redirect mientras el apex siga en WordPress: `app.esitef.com` mandaría a WP y rutas nuevas (`/ingresar/olvidar`) darían 404.

Mantén el dominio `app` en Vercel 2–4 semanas tras el flip.

## Stripe

Actualizar webhook endpoint a `https://esitef.com/api/webhooks/stripe` y `STRIPE_WEBHOOK_SECRET` si Stripe genera nuevo `whsec_`.

## Smoke post-DNS (15 min)

```bash
SMOKE_BASE_URL=https://esitef.com npm run test:cutover-smoke
```

Manual en navegador:

- Login alumno real (sin bridge)
- Dashboard + player `/aprender/...`
- Compra Stripe mínima → matrícula
- `/ingresar/olvidar` → email → `/ingresar/restablecer`

## Rollback (1ª hora)

1. Restaurar A/CNAME apex en SiteGround (screenshot)
2. `AUTH_URL=https://app.esitef.com` + redeploy
3. Reactivar `WP_AUTH_BRIDGE_*` solo si login falla sin WP
4. Neon intacto
