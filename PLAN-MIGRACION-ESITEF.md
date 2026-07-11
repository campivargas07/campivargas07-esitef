# Plan de migración ESITEF Online

> **Última actualización:** 11 jul 2026 (noche — formaciones online, hubs, acordeones, fondo página)  
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
- [x] PayPal sandbox: captura en `/gracias` + verificación webhook (`PAYPAL_WEBHOOK_ID`)
- [x] **Índice editorial `/formaciones`** (10 tarjetas desde `formaciones-content.php`, no el listado LMS de 74 cursos)
- [x] **Subpáginas hub** `/formaciones/[hub]` — 7 hubs exportados desde `formaciones-online-hubs.php`
- [x] Landings Club, Comunica-t y CRECER (grid + acordeón planning + pricing)
- [~] **Paridad visual formaciones** — funcional en móvil; pulido desktop y detalles menores pendientes (ver § diseño)
- [ ] PayPal en producción (webhook registrado en dashboard PayPal live)

### Fase 4 — ETL producción y corte
- [x] Scripts `etl:extract`, `etl:load`, `etl:reconcile` ejecutados en local
- [x] `npm run db:push` con índices únicos de órdenes
- [x] ETL órdenes WooCommerce (HPOS + line items)
- [x] Lesson progress en ETL (8.916 registros desde producción)
- [x] Ensayo de corte local: `npm run cutover:rehearse` (PASSED)
- [x] Delta con dump producción (`esitef-online.sql`, prefijo `yrc_`) — PASSED
- [x] Reconcile ignora matrículas/órdenes nativas + curriculum huérfano WP
- [x] Login usuarios WP reales (fix verificación `$wp$` WordPress 6.8)
- [x] Redirects legacy `/online/*` → rutas Next (`export:wp-redirects`, **91 reglas** con hubs y cursos)
- [ ] Delta final en **producción** (ventana go-live, WP solo lectura)
- [x] Checklist go-live: `npm run cutover:checklist` → `docs/cutover/CHECKLIST-STATUS.md`

### Fase 5 — Post-migración (futuro)
- [ ] Payload CMS u otro CMS headless para contenido editorial
- [ ] dLocal u otros proveedores LATAM
- [x] Redirecciones 301 desde WordPress (`/online/*` vía `export:wp-redirects`)
- [ ] Redirects de lecciones Tutor (`/{curso}/lesson/...`) — middleware dinámico si hace falta
- [ ] Desactivar WordPress en producción

---

## Sesión 11 jul 2026 — Auth, formaciones y redirects

### Autenticación WordPress
- [x] Fix verificación contraseñas `$wp$` (WP 6.8): HMAC-SHA384 con clave `wp-sha384` en `wordpress-password.ts`
- [x] Soporte `user_pass` en texto plano para ~71 usuarios con hash corrupto en dump
- [x] Normalización de email (`trim`) en `auth.ts` y `credentials.ts`
- [x] ETL: upsert de `legacy_identities` en re-runs (`packages/etl/src/load.ts`)
- [x] Usuario demo verificado: `demo@esitef.com` / `demo1234`
- [x] Eliminado atajo temporal “cerrar sesión” del navbar; cierre solo en `/dashboard`

### Arquitectura Formaciones Online
Navegación alineada con WordPress:

```
Navbar “Online” → /formaciones (índice 10 categorías)
                → /formaciones/[hub] (subpáginas editoriales)
                → /cursos/[slug] (landings LMS / compra)
```

| Hub | Ruta | Layout |
|-----|------|--------|
| masterclass | `/formaciones/masterclass` | grid |
| talleres | `/formaciones/talleres` | grid |
| club-de-actualizacion | `/formaciones/club-de-actualizacion` | landing |
| capacidad-funcional-movimiento | `/formaciones/capacidad-funcional-movimiento` | grid |
| comunicat | `/formaciones/comunicat` | landing |
| crecerenmovimiento | `/formaciones/crecerenmovimiento` | landing |
| int-curso-dolor | `/formaciones/int-curso-dolor` | landing |

**Export:** `npm run export:formaciones` → `formaciones-index.json` + `formaciones-hubs.json` desde `esitef-minimal/inc/formaciones-online-hubs.php`

**Componentes:** `FormacionHubContent`, `HubContentGrid`, `HubAccordion`, `HubPricing`, `HubBodyTheme`, `FormacionesIndexGrid`

**CSS:** `apps/web/src/styles/formacion-hub.css` (copiado del tema WP + parches club/comunica-t)

### Acordeones y fondo de página (Club / Comunica-t)
- [x] Acordeones planning (bloques / videos) y FAQ con clase `active` + patrón CSS `grid-template-rows: 0fr → 1fr`
- [x] Fondo degradado en toda la vista vía `HubBodyTheme` → clase `esitef-hub-club-de-actualizacion` en `<body>` (navbar → footer)
- [~] Validación visual desktop pendiente de confirmación por el usuario

### Redirects legacy
- [x] Script `scripts/export-wp-redirects.ts` (Redirection plugin + slugs cursos + hubs)
- [x] Integrado en `apps/web/next.config.ts` → `wp-redirects.json` (**91 reglas**)
- [x] Hubs: `/online/{hub}` → `/formaciones/{hub}`; cursos: `/online/{slug}` → `/cursos/{slug}`

### Datos migrados (referencia local)
- 2.719 usuarios · 74 cursos publicados · 11.448 matrículas · 8.916 lesson progress
- Reconcile PASSED (`docs/cutover/DELTA-LATEST.md`)

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
- [x] `/formaciones` — índice editorial (10 tarjetas)
- [x] `/formaciones/[hub]` — 7 subpáginas hub (estático)
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

#### Código sin commitear (sesión 11 jul)
> Cambios locales sin push: auth WP, formaciones/hubs, redirects, acordeones, `HubBodyTheme`, ETL `load.ts`, docs cutover.

- [ ] **Commit y push** de la sesión actual

#### Diseño y UX (priorizar post-go-live salvo bloqueantes)
- [ ] Validación visual desktop: acordeones Club/Comunica-t, fondo página completa
- [ ] Paridad pixel-perfect hubs restantes vs `esitef-minimal` (CRECER `video-left`, detalles menores)
- [ ] Sprint de diseño global post-lanzamiento (espaciado, tipografía, páginas secundarias)

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
# 1. Levantar bases de datos + schema + seed demo (recomendado tras reiniciar)
cd /workspaces/campivargas07-esitef/esitef-platform
npm run setup:local

# Alternativa manual:
# docker compose up -d
# export DATABASE_URL=postgresql://esitef:esitef@localhost:5433/esitef
# npm run db:push && npm run seed

# 3. Regenerar contenido desde PHP (opcional)
npm run export:presencial
npm run export:formaciones
npm run export:wp-redirects   # requiere DATABASE_URL + WP_TABLE_PREFIX=yrc_

# 4. ETL completo (opcional, requiere WP local en :8080)
npm run etl:extract && npm run etl:load && npm run etl:reconcile

# 5. Reset checkout demo (repetir prueba Stripe)
npm run reset:checkout

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
| Formaciones índice | `apps/web/src/app/formaciones/page.tsx` |
| Formaciones hubs | `apps/web/src/app/formaciones/[hub]/page.tsx` |
| Datos formaciones | `apps/web/src/data/{formaciones-index,formaciones-hubs}.json` |
| Export formaciones | `esitef-platform/scripts/export-formaciones-online.php` |
| Lib formaciones | `apps/web/src/lib/formaciones-online.ts` |
| UI formaciones | `apps/web/src/components/formaciones/*` |
| CSS hubs | `apps/web/src/styles/formacion-hub.css` |
| Redirects WP | `scripts/export-wp-redirects.ts` → `apps/web/src/data/wp-redirects.json` |
| Auth WP passwords | `apps/web/src/lib/auth/wordpress-password.ts` |
| Fuente PHP hubs | `esitef-minimal/inc/formaciones-online-hubs.php` |
| Datos presencial | `esitef-platform/apps/web/src/data/{paises,presenciales,libros,articulos}.json` |
| Export presencial | `esitef-platform/scripts/export-presencial-data.php` |
| Checkout presencial | `apps/web/src/lib/presencial-checkout.ts`, `api/checkout/presencial/route.ts` |
| UI presencial | `apps/web/src/components/presencial/*` |
| ETL | `esitef-platform/packages/etl/src/{extract,load,reconcile,cli}.ts` |
| Schema DB | `esitef-platform/packages/db/src/schema.ts` |
| Cutover | `docs/cutover/{DELTA-LATEST,CUTOVER-RUNBOOK,CHECKLIST-STATUS}.md` |
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

### Dev server y redirects
Tras cambiar `next.config.ts` o regenerar `wp-redirects.json`, reiniciar `npm run dev`.

### Acordeones formaciones
Si el contenido no se expande: verificar clase `active` en el ítem y CSS `grid-template-rows` en `formacion-hub.css` (no usar `max-height` inline en React).

### Conversación / contexto del agente
- Historial Cursor: `/home/codespace/.cursor/projects/workspaces/agent-transcripts/`
- Este archivo + commit en git son la fuente de verdad para retomar el plan.

---

## Próximo paso recomendado

1. ~~Delta local~~ → PASSED (`docs/cutover/DELTA-LATEST.md`)
2. ~~Login WP~~ → corregido (`$wp$` HMAC-SHA384)
3. ~~Redirects `/online`~~ → `npm run export:wp-redirects` (91 reglas)
4. ~~Índice y hubs `/formaciones`~~ → export + componentes React
5. **Validar en navegador (desktop + móvil):** `/formaciones`, hubs Club/Comunica-t, un curso comprado, player con progreso
6. **Commit y push** de cambios de sesión
7. **Producción:** backup MySQL → WP solo lectura → `cutover:delta` + `export:wp-redirects`
8. DNS + webhooks Stripe/PayPal live + puente auth en `esitef.com/online`
9. **Post-go-live:** sprint diseño (paridad visual) + redirects lecciones Tutor si hace falta
