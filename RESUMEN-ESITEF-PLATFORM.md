# ESITEF Platform — Resumen

Plataforma propia de formaciones online (y presenciales) que sustituye WordPress. Live en **https://esitef.com** (Vercel).

## Stack

| Capa | Tecnología |
|------|------------|
| App | Next.js 15 (App Router) + React 19 + TypeScript |
| DB | PostgreSQL (Neon) + Drizzle ORM |
| Auth | Auth.js (NextAuth v5) |
| Pagos | Stripe (+ PayPal opcional) |
| Email | Resend |
| Hosting | Vercel |
| Extra | Sentry, PostHog, Vercel Blob, Playwright |

Monorepo: `apps/web` · `packages/db` · `packages/etl` · scripts de cutover/seed.

## Transición WP → esto

**Origen:** WordPress + Tutor LMS + WooCommerce (tema `esitef-minimal/`, ya legado).

**Cómo se migró:**
1. Prototipo Next.js en paralelo al WP.
2. ETL (`packages/etl`) extrajo usuarios, cursos, progreso y enrollments desde MySQL WP → Postgres.
3. Auth con hashes WP (`$wp$`) y puente temporal para login mientras convivían ambos.
4. Cutover: WP en solo lectura → delta final a Neon → DNS a Vercel → redirects 301 desde rutas WP (`/online/*`).
5. WP apagado; la fuente de verdad es `esitef-platform/`.

Detalle histórico: `PLAN-MIGRACION-ESITEF.md` y `esitef-platform/docs/cutover/`.
