# Plan de migración ESITEF Online

> **Última actualización:** 11 jul 2026  
> Documento de referencia para retomar el trabajo tras reiniciar el entorno o cambiar de máquina.

---

## Objetivo

Migrar **ESITEF Online** desde **WordPress + Tutor LMS + WooCommerce** hacia una plataforma propia:

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Base de datos | PostgreSQL + Drizzle ORM |
| Auth | Auth.js + migración progresiva de contraseñas WP |
| Pagos online | Stripe Checkout + webhooks idempotentes |
| Pagos secundarios | PayPal (adaptador básico, sandbox) |
| ETL | Scripts repetibles desde MySQL (WordPress) |

---

## Estructura del repositorio

```
campivargas07-esitef/
├── esitef-minimal/          # Tema WordPress (referencia de diseño y contenido)
├── esitef-platform/         # Plataforma Next.js (destino de la migración)
│   ├── apps/web/            # Frontend + API routes
│   ├── packages/db/         # Schema Drizzle
│   ├── packages/etl/        # extract / load / reconcile
│   └── scripts/             # audit, seed, cutover, export PHP→JSON
└── PLAN-MIGRACION-ESITEF.md # Este archivo
```

---

## Infraestructura local

| Servicio | Puerto | Comando |
|----------|--------|---------|
| PostgreSQL (plataforma) | **5433** | `cd esitef-platform && docker compose up -d` |
| MariaDB (WordPress) | **3307** | Docker del tema WP |
| Next.js dev | **3000** | `cd esitef-platform && npm run dev` |

### Variables de entorno (`esitef-platform/apps/web/.env.local`)

```bash
DATABASE_URL=postgresql://esitef:esitef@localhost:5433/esitef
AUTH_SECRET=<generar con openssl rand -base64 32>
AUTH_URL=http://localhost:3000
# Stripe, PayPal, bridge WP según .env.example
```

### Usuario demo

- **Email:** `demo@esitef.com`
- **Password:** `demo1234`
- **Curso:** `/cursos/introduccion-esitef` → player en `/aprender/introduccion-esitef`

---

## Fases del plan

### Fase 1 — Fundamentos (hecho en gran parte)
- [x] Monorepo Next.js + Drizzle + Auth.js
- [x] Docker Postgres
- [x] Auth bridge WordPress (`esitef-minimal/deploy/mu-plugins/esitef-auth-bridge.php`)
- [x] ETL base: usuarios, cursos, matrículas
- [x] Stripe checkout online + webhook idempotente
- [x] Seed / prototipo vertical

### Fase 2 — LMS online (hecho en gran parte)
- [x] Catálogo `/formaciones` y landing `/cursos/[slug]`
- [x] Player multi-lección `/aprender/[slug]/[lessonId]` con sidebar y progreso
- [x] Quiz, certificados, dashboard alumno
- [x] ETL ampliado: curriculum (módulos/lecciones), precios, thumbnails
- [x] ETL lesson progress desde `wp_usermeta`
- [x] ETL órdenes idempotentes (`legacyTutorOrderId` + índices únicos en schema)

### Fase 3 — UX y páginas estáticas (en curso)
- [x] Login pantalla completa (`/ingresar` + `auth.css`)
- [x] La Escuela (`/la-escuela`) y Contacto (`/contacto` + `POST /api/contact`)
- [x] Mentorías (`/mentorias`)
- [x] Libros (`/libros`) + formularios descarga en `/[slug]`
- [x] Artículos (`/articulos`)
- [x] Presenciales: 6 países + 15 landings de curso vía `/[slug]`
- [x] Export PHP→JSON (`npm run export:presencial`)
- [x] Checkout presencial Stripe (pago único + suscripción 3 cuotas, 4 instancias)
- [x] Páginas marketing: `/sesiones-online-con-tomas-bonino`, `/talleres-privados-clinicas`
- [ ] PayPal en producción (webhook verificado en dashboard)

### Fase 4 — ETL producción y corte
- [x] Scripts `etl:extract`, `etl:load`, `etl:reconcile` ejecutados en local
- [x] `npm run db:push` con índices únicos de órdenes
- [x] ETL órdenes WooCommerce (HPOS + line items)
- [ ] Lesson progress masivo en producción
- [x] Ensayo de corte local: `npm run cutover:rehearse` (PASSED)
- [ ] Delta final en producción: `npm run cutover:delta`
- [ ] Checklist go-live: `npm run cutover:checklist`

### Fase 5 — Post-migración (futuro)
- [ ] Payload CMS u otro CMS headless para contenido editorial
- [ ] dLocal u otros proveedores LATAM
- [ ] Redirecciones 301 masivas desde WordPress
- [ ] Desactivar WordPress en producción

---

## Checklist detallado

### Completado ✅

#### Plataforma base
- [x] Prototipo Next.js en monorepo (`dc160a0`)
- [x] Landing de curso online integrada (`0014fc6`)
- [x] Estilos globales desde tema WP
- [x] `outputFileTracingRoot` en `next.config.ts` (evita conflictos de lockfile en monorepo)

#### ETL (commit `a521c17`)
- [x] Extract: usuarios, cursos, topics→módulos, lecciones, precios WC/Tutor
- [x] Thumbnails (filtra `"NULL"` del TSV)
- [x] Lesson progress desde Tutor meta
- [x] Órdenes idempotentes por `legacyTutorOrderId`
- [x] CLI con `process.exit(0)` para no colgar el pool de Postgres

#### Rutas web implementadas
- [x] `/` — home
- [x] `/ingresar` — login fullscreen
- [x] `/formaciones` — catálogo online
- [x] `/cursos/[slug]` — landing de curso
- [x] `/aprender/[slug]/[lessonId]` — player
- [x] `/dashboard`, `/quiz/[slug]`, `/certificados/[slug]`, `/gracias`
- [x] `/la-escuela`, `/contacto`
- [x] `/mentorias`, `/libros`, `/articulos`
- [x] `/[slug]` — países, presenciales, formularios libros, redirects legacy

#### Presenciales
- [x] 6 países: españa, peru, argentina, mexico, colombia, uruguay
- [x] 15 landings de formación presencial
- [x] CSS `pais.css`, `presencial.css`
- [x] `PresencialCheckoutPlans` + `POST /api/checkout/presencial`
- [x] 4 instancias con planes en `lib/presencial-checkout.ts`

#### APIs
- [x] `POST /api/contact`
- [x] `POST /api/libros/descarga`
- [x] `POST /api/checkout/stripe` (cursos online)
- [x] `POST /api/checkout/presencial`
- [x] `POST /api/webhooks/stripe`
- [x] `POST /api/lessons/complete`, `POST /api/quiz/submit`

#### Build
- [x] `npm run build` exitoso (~47 páginas estáticas)
- [x] Fix error `Cannot find module './383.js'` (caché `.next` corrupta — ver notas abajo)

---

### Pendiente ⬜

#### Código sin commitear
> Sesión de calidad/corte commiteada (E2E, smoke, verify:stripe, Yoast redirects).

#### Base de datos
- [x] `npm run db:push` aplicado (índices únicos de órdenes)

#### Checkout y pagos
- [x] Plan **3-cuotas** presencial: `mode: subscription` + webhook cancela tras 3 `invoice.paid`
- [x] Manejo de errores JSON en checkout (falta `STRIPE_SECRET_KEY` → mensaje claro)
- [x] PayPal Orders API (sandbox) + webhook `POST /api/webhooks/paypal`
- [x] Checkout presencial exportado desde PHP → `presencial-checkout.json` (4 instancias; las otras 11 usan inscripción manual WhatsApp/banco)

#### Páginas faltantes
- [x] `/sesiones-online-con-tomas-bonino`
- [x] `/talleres-privados-clinicas`

#### ETL / corte
- [x] Órdenes WooCommerce (extract HPOS + line items + producto→curso)
- [x] Reconcile PASSED (última ejecución OK)
- [x] `cutover:rehearse` ejecutado en local (ver `docs/cutover/REHEARSAL-LATEST.md`)
- [ ] `cutover:delta` en producción

#### Calidad
- [x] Smoke HTTP `npm run test:smoke` (rutas públicas + redirect)
- [x] Playwright E2E (`npm run test:e2e` — 15/15 OK tras `playwright install-deps`)
- [x] Redirecciones 301 presencial + Yoast (`export:yoast-redirects` + `wp-redirects.json`)

---

## Comandos para retomar tras reiniciar

```bash
# 1. Levantar bases de datos
cd /workspaces/campivargas07-esitef/esitef-platform
docker compose up -d

# 2. Variables (si .env.local ya existe, saltar)
export DATABASE_URL=postgresql://esitef:esitef@localhost:5433/esitef

# 3. Schema (solo si hay cambios nuevos en packages/db)
npm run db:push

# 4. Regenerar datos presenciales desde PHP (opcional)
npm run export:presencial

# 5. ETL completo (opcional, si WP local está arriba)
npm run etl:extract && npm run etl:load && npm run etl:reconcile

# 6. Dev server — NO correr build y dev a la vez
pkill -f "next dev" 2>/dev/null || true
rm -rf apps/web/.next   # solo si hay errores de chunks (383.js, etc.)
npm run dev
# → http://localhost:3000

# 7. Smoke tests (sin browser)
npm run test:smoke

# 7b. Verificar Stripe + webhook (sin browser)
npm run verify:stripe

# 8. E2E Playwright (requiere deps del sistema)
cd apps/web && npx playwright install-deps chromium && npm run test:e2e
```

---

## Archivos clave recientes

| Área | Ruta |
|------|------|
| Router dinámico | `esitef-platform/apps/web/src/app/[slug]/page.tsx` |
| Datos presencial | `esitef-platform/apps/web/src/data/{paises,presenciales,libros,articulos}.json` |
| Export script | `esitef-platform/scripts/export-presencial-data.php` (+ `presencial-checkout.json`) |
| Checkout presencial | `apps/web/src/lib/presencial-checkout.ts`, `api/checkout/presencial/route.ts` |
| UI presencial | `apps/web/src/components/presencial/*` |
| ETL | `esitef-platform/packages/etl/src/{extract,load,reconcile,cli}.ts` |
| Schema DB | `esitef-platform/packages/db/src/schema.ts` |
| Diseño checkout WP | `esitef-minimal/deploy/CHECKOUT-DESIGN-SPEC.md` |
| Auth bridge | `esitef-minimal/deploy/mu-plugins/esitef-auth-bridge.php` |

---

## Notas y problemas conocidos

### Error `Cannot find module './383.js'`
Caché `.next` desincronizada (típico si `npm run build` corre con `next dev` activo).

**Solución:**
```bash
pkill -f "next dev" || true
rm -rf esitef-platform/apps/web/.next
cd esitef-platform && npm run dev
```

### Thumbnails `"NULL"`
Algunos cursos migrados tienen `thumbnailUrl` como string `"NULL"` en vez de `null`. El ETL ya filtra en extract; conviene re-correr load o limpiar en DB.

### Conversación / contexto del agente
- Historial Cursor: `/home/codespace/.cursor/projects/workspaces/agent-transcripts/`
- Este archivo + commit en git son la fuente de verdad para retomar el plan.

---

## Próximo paso recomendado

1. ~~Configurar `.env.local`: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`~~ → `npm run verify:stripe` PASSED
2. Checkout real en navegador (tarjeta `4242…`) con `stripe listen` activo
3. En producción/staging: `npm run export:yoast-redirects` + `cutover:delta`
4. `npm run cutover:checklist` antes del go-live
5. Push de commits locales a `origin/main`
