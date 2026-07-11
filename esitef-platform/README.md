# ESITEF Platform — Migración Tutor LMS → Next.js

Plataforma objetivo para migrar ESITEF Online desde WordPress + Tutor LMS + WooCommerce.

## Stack

- **Next.js 15** (App Router) + TypeScript
- **PostgreSQL** + Drizzle ORM
- **Auth.js** con migración progresiva de contraseñas WordPress
- **Stripe Checkout** + webhooks idempotentes
- **PayPal** (adaptador secundario)
- **ETL** repetible desde MySQL WordPress

## Inicio rápido

```bash
# 1. PostgreSQL de la plataforma
cd esitef-platform
docker compose up -d

# 2. Variables de entorno
cp .env.example apps/web/.env.local
cp .env.example .env
# Editar AUTH_SECRET, DATABASE_URL, claves Stripe

# 3. Instalar dependencias
npm install

# 4. Crear esquema
export DATABASE_URL=postgresql://esitef:esitef@localhost:5433/esitef
npm run db:push -w @esitef/db

# 5. Seed del prototipo vertical
npx tsx scripts/seed-prototype.ts

# 6. (Opcional) Migrar desde WordPress local
npm run audit
npm run etl:extract
npm run etl:load
npm run etl:reconcile

# 7. Arrancar web
npm run dev
```

Abre http://localhost:3000

**Demo:** `demo@esitef.com` / `demo1234`

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run audit` | Auditoría de WordPress/Tutor/WooCommerce |
| `npm run etl:extract` | Extrae usuarios, cursos, matrículas, pedidos |
| `npm run etl:load` | Carga en PostgreSQL con mapeos legacy |
| `npm run etl:reconcile` | Conciliación origen vs destino |
| `npm run cutover:rehearse` | Ensayo completo de corte |
| `npm run cutover:delta` | Importación delta |
| `npm run cutover:checklist` | Checklist de corte |

## Puente de autenticación WordPress

Durante la migración, el mu-plugin `esitef-minimal/deploy/mu-plugins/esitef-auth-bridge.php` expone:

`POST /wp-json/esitef/v1/verify-password`

Configura `ESITEF_AUTH_BRIDGE_SECRET` en WordPress y `WP_AUTH_BRIDGE_SECRET` en Next.js.

La verificación local en Node también soporta hashes `$P$` (phpass) y `$wp$` (WordPress 6.8+).

## Pagos

- **Nunca** desbloquear cursos desde la URL de éxito
- Solo desde webhook Stripe verificado (`checkout.session.completed`)
- Tabla `webhook_events` garantiza idempotencia

## Estructura

```
esitef-platform/
├── apps/web/          # Next.js frontend + API
├── packages/db/       # Drizzle schema
├── packages/etl/    # Extract, load, reconcile
├── scripts/           # audit, seed, cutover
└── docs/              # Informes de auditoría y corte
```

## Referencia de diseño

Los tokens CSS provienen de `esitef-minimal-migration-ref/style.css`.
