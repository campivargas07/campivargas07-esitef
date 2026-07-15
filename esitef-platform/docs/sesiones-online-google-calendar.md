# Sesiones online — Google Calendar

Disponibilidad y confirmación de citas con Tomás Bonino.

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `GOOGLE_CALENDAR_ID` | ID del calendario (p. ej. `primary` o email del calendario) |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | JSON de cuenta de servicio en una línea |
| `STRIPE_SECRET_KEY` | Checkout Stripe |
| `STRIPE_WEBHOOK_SECRET` | Confirmación de pago en servidor |
| `AUTH_URL` | URL base para redirects de Stripe |

## Configurar Google Calendar

1. Crear proyecto en [Google Cloud Console](https://console.cloud.google.com/).
2. Habilitar **Google Calendar API**.
3. Crear **cuenta de servicio** y descargar JSON.
4. En Google Calendar de Tomás: **Configuración → Compartir con** el `client_email` de la cuenta de servicio (permiso *Hacer cambios en eventos*).
5. Copiar el JSON a `GOOGLE_SERVICE_ACCOUNT_JSON` (escapar saltos de línea de la clave como `\n`).

## Sin Google Calendar (desarrollo)

Si las variables no están definidas, el calendario usa **fechas demo** (martes y jueves, próximas 8 semanas) y horarios fijos 10:00 / 12:00 / 16:00 (Madrid). Los cupos sí persisten en PostgreSQL.

## Flujo

1. `GET /api/sesiones-online/calendario` — fechas del mes con cupo.
2. `GET /api/sesiones-online/disponibilidad?fecha=` — horarios libres del día.
3. `POST /api/checkout/sesiones-online` — hold 15 min + Stripe Checkout.
4. Webhook Stripe / página confirmación — marca orden pagada, confirma reserva, crea evento en Google Calendar.

## Precio

Catálogo multi-moneda: clave `sesiones-online-tomas` en `online-currency-prices.json` (base 90 USD). Respeta cookie `esitef_online_currency`.

## Migración DB

```bash
cd packages/db && npm run push
# o aplicar packages/db/drizzle/0001_sesion_online_bookings.sql
```
