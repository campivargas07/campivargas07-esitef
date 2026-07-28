# ESITEF — Instrucciones para agentes

## Estructura

- `esitef-platform/` — plataforma Next.js 15 (App Router) + Drizzle + Auth.js. **Aquí se trabaja.**
- `esitef-minimal/` — tema WordPress legado. **No leer para implementar, no editar, no portar.** Solo referencia de contenido si se pide explícitamente.

## Entorno (Cloud Agents)

El entorno se configura solo vía `.cursor/environment.json` (npm install, `.env.local`, Postgres Docker en :5433, `db:push`, seed). Si algo falta:

```bash
cd esitef-platform
npm run setup:local   # Postgres + schema + seed demo
npm run dev           # http://localhost:3000
```

- Usuario demo: `demo@esitef.com` / `demo1234`
- `DATABASE_URL=postgresql://esitef:esitef@localhost:5433/esitef`
- NO correr `npm run build` con `npm run dev` activo (rompe la caché `.next`). Si aparece `Cannot find module './383.js'`: `pkill -f "next dev"; rm -rf apps/web/.next; npm run dev`.

## Verificación (obligatoria tras cambios de lógica)

```bash
cd esitef-platform
npm run build          # compila
npm run test:smoke     # requiere dev server en :3000
```

E2E opcional: `cd apps/web && npx playwright install-deps chromium && npm run test:e2e`.

## Reglas del repo

- `.env.local` nunca se commitea; secretos reales viven en Vercel / dashboard de Cursor.
- Cambios en `next.config.ts` o `apps/web/src/data/wp-redirects.json` → reiniciar dev server.
- Checkout Stripe/webhooks: verificar con `npm run verify:stripe` (requiere keys en `.env.local`).
- Fuente de verdad del plan: `PLAN-MIGRACION-ESITEF.md` y `esitef-platform/docs/cutover/CHECKLIST-STATUS.md`.

## Producción (contexto para fixes de Sentry)

- App live: `https://app.esitef.com` (Vercel, auto-deploy desde `main`).
- DB producción: Neon Postgres. Nunca apuntar scripts locales a Neon salvo cutover.
- Webhooks críticos: `POST /api/webhooks/stripe`, `POST /api/webhooks/paypal` — idempotentes, no romper esa propiedad en fixes.
