# Vercel — paso a paso (pantalla que ves ahora)

## Parte A — Configurar el proyecto (una sola vez)

### 1. Ir a Settings

En la barra izquierda de tu proyecto (donde ves *Firewall*, *Domains*, etc.):

1. Clic en **Settings** (abajo del todo).
2. Si no ves submenús, entras directo a la página de configuración.

### 2. Root Directory (lo más importante)

1. En Settings, busca la sección **Build and Deployment** (o **General**).
2. Baja hasta **Root Directory**.
3. Clic en **Edit**.
4. Escribe exactamente:
   ```
   esitef-platform/apps/web
   ```
5. **Save**.

> Si no encuentras Root Directory: en Settings usa la búsqueda (si hay) o mira bajo **Build and Deployment**. En proyectos nuevos a veces está en la pantalla de import del repo (Edit junto a `./`).

### 3. Build commands (deben coincidir con `vercel.json`)

En la misma sección **Build and Deployment**:

| Campo | Valor |
|-------|-------|
| Framework Preset | Next.js |
| Install Command | *(vacío — usa `vercel.json` del repo)* |
| Build Command | *(vacío — usa `vercel.json`)* |
| Output Directory | *(vacío)* |

Si no puedes dejarlos vacíos, pon:

- Install: `cd ../.. && npm install`
- Build: `cd ../.. && npm run build`

*(Solo si Root Directory = `esitef-platform/apps/web`.)*

### 4. Environment Variables

**Settings → Environment Variables** (menú izquierdo o dentro de Settings).

Añade cada fila para **Production** y **Preview**:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://...@ep-....neon.tech/neondb?sslmode=require` |
| `AUTH_SECRET` | Genera con `openssl rand -base64 32` en terminal |
| `AUTH_URL` | `https://campivargas07-esitef.vercel.app` (tu URL real de Vercel) |
| `WP_AUTH_BRIDGE_URL` | `https://esitef.com/online/wp-json/esitef/v1/verify-password` |
| `WP_AUTH_BRIDGE_SECRET` | Igual que en `wp-config.php` de WordPress |
| `STRIPE_SECRET_KEY` | `sk_test_...` o `sk_live_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` o `pk_live_...` |

Guarda cada variable.

### 5. Redeploy

1. Pestaña **Deployments** (arriba).
2. El último deploy → botón **⋯** (tres puntos) → **Redeploy**.
3. Marca **Use existing Build Cache** desactivado si falló antes.
4. **Redeploy**.

Espera estado **Ready** (verde).

---

## Parte B — Si el build sigue en rojo

### Error: `Cannot find module 'next/dist/compiled/next-server/...'`

Causa: monorepo — `next` está en `esitef-platform/node_modules`, no en `apps/web`.

**Solución:** confirma Root Directory = `esitef-platform/apps/web` y que el repo tiene `vercel.json` (commit `493c04a` o posterior + `vercel.json` en la raíz del repo).

### Ver el error exacto

1. **Deployments** → clic en el deploy rojo.
2. **Building** / **Build Logs**.
3. Baja hasta la última línea roja.

---

## Parte C — Probar que funciona

1. Clic en **Visit** (o la URL `*.vercel.app`).
2. Abre `/formaciones` — debe cargar.
3. Abre `/ingresar` — login con usuario WordPress real.
4. Tras login, `/dashboard` — debe listar cursos.

---

## Parte D — Orden completo (checklist)

- [ ] Neon: `db:push` + `cutover:delta` PASSED (~2718 usuarios)
- [ ] Git: push a `main` con `vercel.json`
- [ ] Vercel: Root Directory = `esitef-platform/apps/web`
- [ ] Vercel: env vars (mínimo `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, bridge WP)
- [ ] Redeploy → **Ready**
- [ ] Login real en `.vercel.app`

---

## Alternativa: re-importar el repo

Si no aparece Root Directory:

1. **Settings → General → Delete Project** (solo si aceptas borrar el proyecto Vercel, no el código).
2. **Add New → Project** → mismo repo GitHub.
3. En **Configure Project**, antes de Deploy: **Edit** junto a `./` → `esitef-platform/apps/web`.
4. Añade env vars → **Deploy**.
