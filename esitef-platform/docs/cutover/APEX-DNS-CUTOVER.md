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

## Vercel Domains (hacer primero — sin tocar DNS aún)

1. Entra a [vercel.com](https://vercel.com) → proyecto de la app ESITEF
2. **Settings → Domains → Add**
3. Añade `esitef.com`
4. Cuando pregunte por `www.esitef.com`, acéptalo (recomendado)
5. Marca `esitef.com` como **Primary** (menú ⋯ del dominio si hace falta)
6. En `www`, elige que **redirija** a `esitef.com` (308)
7. En la misma pantalla Domains, Vercel muestra exactamente qué hay que poner en DNS. **Cópialo tal cual** (no inventes valores). Suele ser:

| En Vercel verás | Tipo | Name / Host | Value |
|-----------------|------|-------------|--------|
| Apex `esitef.com` | **A** | `@` (o vacío / `esitef.com`) | algo como `76.76.21.21` |
| `www.esitef.com` | **CNAME** | `www` | algo como `cname.vercel-dns.com` o un `….vercel-dns-0xx.com` |
| A veces | **TXT** | `_vercel` | un string de verificación |

Deja esa pestaña abierta: SiteGround debe usar **esos** valores, no unos genéricos de memoria.

---

## SiteGround DNS Zone Editor — paso a paso

### Abrir el editor

**Opción A (Site Tools del sitio):**  
Site Tools (sitio `esitef.com`) → **Domain → DNS Zone Editor**

**Opción B (Client Area):**  
[my.siteground.com](https://my.siteground.com) → **Services → Domains** → `esitef.com` → **Settings** → pestaña **DNS Zone Editor**

### Antes de editar

1. Haz **screenshot** de toda la lista de registros (rollback).
2. Identifica mentalmente qué **no** vas a tocar (tabla abajo).

### Qué NO tocar (crítico)

| Registro (Name / Host) | Por qué |
|------------------------|---------|
| **CNAME** `assets` (→ `assets.esitef.com`) | Imágenes del LMS |
| **CNAME** `app` | La app sigue viva en `app.esitef.com` durante semanas |
| **MX** (correo `@`) | Email `info@…` en SiteGround |
| **TXT** SPF / DKIM Resend (`send`, `resend._domainkey`, etc.) | Emails transaccionales |
| **TXT** `_dmarc`, BIMI (`default._bimi`) | Entrega / marca en bandeja |
| **NS** | Nameservers SiteGround — no los cambies a Vercel |

Si editas MX o SPF por error, se rompe el correo.

### Editar el apex (`esitef.com` → Vercel)

Hoy el registro **A** de `@` (o `esitef.com`) apunta a la **IP de SiteGround** (WordPress). Hay que cambiarlo a la IP de Vercel.

1. En DNS Zone Editor busca el registro tipo **A** cuyo Name/Host sea `@` o esté vacío o diga `esitef.com` (el del dominio raíz, **no** `www`, **no** `app`, **no** `assets`).
2. **Edit** (lápiz) — o bórralo y crea uno nuevo si solo permite Create.
3. Campos típicos en SiteGround:
   - **Type:** A  
   - **Name / Host:** `@` (o déjalo vacío si el panel ya asume el dominio)  
   - **TTL:** default / 1 hour está bien  
   - **Value / Points to:** la IP que muestra Vercel (a menudo `76.76.21.21` — **usa la del panel Vercel**)
4. Guarda / Create.

Si al crear dice que ya existe un A para `@`, edita el existente; no dejes dos A distintos para el mismo host (conflicto).

### Editar `www`

1. Busca un registro **CNAME** (o a veces **A**) con Name = `www`.
2. Si es **A** hacia IP de SiteGround: bórralo (Vercel pide CNAME para www).
3. Crea o edita **CNAME**:
   - **Type:** CNAME  
   - **Name / Host:** `www`  
   - **Value / Points to:** exactamente lo que diga Vercel (ej. `cname.vercel-dns.com` — si el panel SiteGround añade solo el host, no pongas `https://`; si pide FQDN con punto final, copia el valor de Vercel tal cual)
4. Guarda.

### TXT `_vercel` (solo si Vercel lo pide)

Algunos proyectos piden verificación:

- **Type:** TXT  
- **Name:** `_vercel`  
- **Value:** el string largo que muestra Vercel  

Crea ese TXT y espera unos minutos; en Domains debería pasar a **Valid**.

### Comprobar propagación

En Vercel → Domains, `esitef.com` y `www` deben quedar en verde / Valid.

En terminal (opcional):

```bash
dig +short A esitef.com
# debe mostrar la IP de Vercel

dig +short CNAME www.esitef.com
# debe mostrar el target vercel-dns
```

Propagación: minutos a unas horas (a veces hasta 24–48 h). No apagues WordPress PHP hasta que `https://esitef.com` cargue la app Next.

### Después del DNS válido

1. Vercel env Production: `AUTH_URL=https://esitef.com`, `NEXT_PUBLIC_SITE_URL=https://esitef.com` → **Redeploy**
2. Smoke + luego redirect `app` → apex (sección siguiente)

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
