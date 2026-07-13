# Vercel + Neon — guía paso a paso (primer deploy ESITEF)

> Para quien nunca ha usado estas plataformas. Tiempo estimado: **1–2 h** la primera vez.

## Qué vas a montar

| Servicio | Qué hace | Coste típico |
|----------|----------|--------------|
| **Neon** | PostgreSQL en la nube (usuarios, cursos, matrículas) | Free tier suficiente para empezar |
| **Vercel** | Host de la app Next.js | Free tier para preview; Pro si necesitas más |

**SiteGround se queda** para WordPress en `esitef.com/online` (auth bridge + rollback) al menos 2–4 semanas.

---

## Parte 1 — Neon (base de datos)

### 1.1 Crear cuenta y proyecto

1. Entra en [neon.tech](https://neon.tech) → **Sign up** (GitHub es lo más rápido).
2. **New project**:
   - Name: `esitef-prod`
   - Region: **US East (Ohio)** o **EU (Frankfurt)** — elige la más cercana a tus usuarios.
   - Postgres: deja la versión por defecto (16).
3. Pulsa **Create project**.

### 1.2 Copiar la connection string

1. En el dashboard del proyecto → **Connect**.
2. Copia la URL que empieza por:
   ```
   postgresql://neondb_owner:xxxx@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
   ```
3. Guárdala en un gestor de contraseñas — es tu **`DATABASE_URL` de producción**.

### 1.3 Crear las tablas (schema)

Desde **Codespace** o tu máquina (no hace falta instalar nada en Neon):

```bash
cd esitef-platform
export DATABASE_URL='postgresql://neondb_owner:...@ep-....neon.tech/neondb?sslmode=require'
npm run db:push
```

Debe terminar sin errores. Eso crea todas las tablas vacías.

### 1.4 Importar datos de WordPress (ETL)

Con el dump fresco de producción (o túnel MySQL):

```bash
export DATABASE_URL='...'          # misma URL Neon
export WP_TABLE_PREFIX=yrc_
# Si usas MariaDB local con dump:
export WP_MYSQL_HOST=127.0.0.1
export WP_MYSQL_PORT=3307

npm run pull:wp-db -- --import     # opcional: refresca dump + import local
npm run cutover:delta              # debe terminar: reconcile PASSED
```

> **Importante:** el ETL se ejecuta desde tu Codespace contra Neon, no desde la consola de Neon.

---

## Parte 2 — Vercel (app Next.js)

### 2.1 Crear cuenta y conectar GitHub

1. [vercel.com](https://vercel.com) → **Sign up** con GitHub.
2. Autoriza acceso al repo `campivargas07-esitef` (o el nombre que tenga tu fork).

### 2.2 Importar el proyecto

1. **Add New… → Project**.
2. Selecciona el repo de GitHub.
3. **Configuración crítica del monorepo:**

   | Campo | Valor |
   |-------|-------|
   | **Root Directory** | `esitef-platform/apps/web` |
   | **Framework Preset** | Next.js (auto) |
   | **Build Command** | *(dejar vacío — usa `vercel.json`)* |
   | **Install Command** | *(dejar vacío — usa `vercel.json`)* |

4. **No despliegues aún** — primero las variables de entorno (paso 2.3).

### 2.3 Variables de entorno

En **Settings → Environment Variables**, añade estas para **Production** (y también **Preview** para probar):

| Variable | Valor | Notas |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql://...@neon.tech/...?sslmode=require` | De Neon paso 1.2 |
| `AUTH_SECRET` | string aleatoria 32+ chars | Genera: `openssl rand -base64 32` |
| `AUTH_URL` | `https://TU-DOMINIO.vercel.app` | Al principio la URL preview; luego `https://esitef.com` |
| `WP_AUTH_BRIDGE_URL` | `https://esitef.com/online/wp-json/esitef/v1/verify-password` | WP en SiteGround |
| `WP_AUTH_BRIDGE_SECRET` | *(mismo que en `wp-config.php` de WP)* | Debe coincidir exactamente |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Clave **live** de Stripe |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Lo creas en paso 2.6 |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Clave pública live |

Opcionales (más adelante):

| Variable | Valor |
|----------|-------|
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | Solo si activas PayPal directo |
| `PAYPAL_MODE` | `live` |
| `CONTACT_EMAIL` | `info@esitef.com` |
| `STRIPE_TAX_ENABLED` | `true` si usas Stripe Tax |

### 2.4 Primer deploy

1. **Deploy** (o push a `main` si conectaste auto-deploy).
2. Espera el build (~2–5 min). Si falla, revisa **Build Logs** — casi siempre es una env var faltante.
3. Abre la URL tipo `https://esitef-platform-xxxx.vercel.app`.

### 2.5 Probar el preview

Con la URL de Vercel:

```bash
cd esitef-platform
SMOKE_BASE_URL=https://TU-PROYECTO.vercel.app npm run test:smoke
```

Manual:

- [ ] Home y `/formaciones` cargan
- [ ] Login con usuario WP real
- [ ] Dashboard muestra cursos matriculados
- [ ] Redirect: `/online/masterclass` → `/formaciones/masterclass`

Actualiza `AUTH_URL` en Vercel a la URL preview si el login falla por dominio.

### 2.6 Webhook Stripe (live)

1. [Stripe Dashboard](https://dashboard.stripe.com) → **Developers → Webhooks → Add endpoint**.
2. URL: `https://TU-DOMINIO.vercel.app/api/webhooks/stripe` (luego la definitiva).
3. Eventos mínimos: `checkout.session.completed`, `charge.refunded`.
4. Copia **Signing secret** (`whsec_...`) → variable `STRIPE_WEBHOOK_SECRET` en Vercel.
5. **Redeploy** en Vercel para que tome el nuevo secret.

---

## Parte 3 — Dominio personalizado

Tienes dos caminos. El **A** es más seguro para el primer corte.

### Opción A — Subdominio (recomendado al empezar)

Ejemplo: `app.esitef.com` → Vercel, `esitef.com/online` → SiteGround (WordPress).

1. Vercel → proyecto → **Settings → Domains** → añade `app.esitef.com`.
2. Vercel te muestra un registro DNS (CNAME o A).
3. SiteGround → **Site Tools → Domain → DNS Zone Editor**:
   - Añade **CNAME** `app` → `cname.vercel-dns.com` (o lo que indique Vercel).
4. Espera propagación (5 min – 48 h).
5. Cambia en Vercel: `AUTH_URL=https://app.esitef.com`.

Los redirects `/online/*` en Next siguen funcionando cuando el tráfico pase por ese dominio. Para el corte total a `esitef.com` raíz, ver opción B.

### Opción B — `esitef.com` raíz en Vercel

1. Vercel → Domains → añade `esitef.com` y `www.esitef.com`.
2. En SiteGround DNS, apunta el apex a Vercel (registros que te da Vercel).
3. **Cuidado:** WordPress en `/online` debe seguir accesible para el auth bridge. Opciones:
   - Mantener WP en subdominio (`online.esitef.com`) y actualizar `WP_AUTH_BRIDGE_URL`, o
   - Configurar en Vercel **rewrites** hacia el origen SiteGround solo para `/online/wp-json/*` y `/online/wp-login.php` (avanzado — pedir ayuda en Agent mode).

---

## Parte 4 — Checklist antes del corte real

- [ ] Neon: `db:push` OK
- [ ] Neon: `cutover:delta` → reconcile **PASSED**
- [ ] Vercel: build OK en preview
- [ ] Smoke + login real en preview
- [ ] Stripe webhook apuntando a Vercel
- [ ] `WP_AUTH_BRIDGE_SECRET` igual en Vercel y `wp-config.php`
- [ ] Backup SiteGround (MySQL + uploads)
- [ ] mu-plugins subidos (`upload-mu-plugins.sh`)
- [ ] `ESITEF_CUTOVER_READONLY` en wp-config (solo en ventana de corte)

Ver también: `GO-LIVE-EXECUTION.md` y `CUTOVER-RUNBOOK.md`.

---

## Errores frecuentes

| Síntoma | Causa | Solución |
|---------|-------|----------|
| Build falla “Cannot find module @esitef/db” | Root Directory mal puesto | Debe ser `esitef-platform/apps/web` |
| Login 401 | `AUTH_URL` no coincide con la URL del navegador | Iguala `AUTH_URL` al dominio exacto |
| Login falla credenciales WP | Bridge secret distinto o mu-plugin no subido | Revisar secret + `esitef-auth-bridge.php` |
| Checkout error Stripe | Claves test en prod o webhook mal | Usar `sk_live_` / `pk_live_` + webhook live |
| DB connection error | Falta `?sslmode=require` en Neon | Añadir al final de `DATABASE_URL` |
| Página vacía / 500 | `DATABASE_URL` no en Vercel | Añadir env var y redeploy |

---

## Orden recomendado (resumen)

```
1. Neon → proyecto → copiar DATABASE_URL
2. npm run db:push (schema)
3. npm run cutover:delta (datos)
4. Vercel → import repo → root apps/web → env vars
5. Deploy preview → smoke + login
6. Stripe webhook → redeploy
7. Dominio (app.esitef.com o esitef.com)
8. Ventana de corte (GO-LIVE-EXECUTION.md)
```

---

## Costes orientativos

- **Neon Free:** ~0.5 GB, suficiente para validar; escala si crece.
- **Vercel Hobby:** gratis para proyectos personales; dominio custom incluido.
- **Vercel Pro:** si necesitas más builds/equipo (~$20/mes).

No cancelues SiteGround hasta confirmar que login, checkout y redirects funcionan en producción.
