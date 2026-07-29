# Chatwoot — bandeja unificada Email + WhatsApp

Bandeja open source para atender **info@esitef.com** y **WhatsApp** desde un solo lugar. La plataforma sincroniza compradores como contactos y embebe el widget de chat en `app.esitef.com`.

**DNS de ESITEF:** SiteGround → **Site Tools → Domain → DNS Zone Editor** (zona `esitef.com`).

## Arquitectura

```
app.esitef.com (widget) ──► Chatwoot (chat.esitef.com)
                              ├── Email inbox ← forward info@esitef.com
                              └── WhatsApp inbox ← Evolution API
esitef-platform ──API──► Chatwoot (contactos tras compra)
```

## 1. Desplegar Chatwoot en Railway

1. Abrir [Deploy Chatwoot en Railway](https://railway.com/deploy/chatwoot-all-in-one-pgvector) (plantilla All-in-One con pgvector).
2. Generar `SECRET_KEY_BASE`: `openssl rand -hex 64` y pegarlo en variables de Railway.
3. Tras el deploy, en el servicio Chatwoot → **Settings → Networking → Custom Domain** → `chat.esitef.com`.
4. En SiteGround DNS Zone Editor, crear **CNAME**:
   - **Name:** `chat`
   - **Value:** el dominio que Railway asigna (p.ej. `xxx.up.railway.app`)
5. En Railway, variable `FRONTEND_URL=https://chat.esitef.com`.
6. Abrir `https://chat.esitef.com` → wizard: cuenta **ESITEF**, usuario admin.

### SMTP (recomendado)

Para notificaciones a agentes y respuestas por email, en Railway (Web + Sidekiq):

| Variable | Ejemplo |
|----------|---------|
| `SMTP_ADDRESS` | `smtp.resend.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USERNAME` | `resend` |
| `SMTP_PASSWORD` | API key Resend |
| `SMTP_AUTHENTICATION` | `login` |
| `SMTP_ENABLE_STARTTLS_AUTO` | `true` |
| `MAILER_SENDER_EMAIL` | `info@esitef.com` |

## 2. Desplegar Evolution API

Evolution API conecta un número normal de WhatsApp (Baileys) con Chatwoot.

### Opción A — Railway (segundo servicio)

1. Crear servicio Docker en Railway: imagen `evoapicloud/evolution-api:latest`, puerto `8080`.
2. Variables mínimas:
   - `AUTHENTICATION_API_KEY` — token secreto (generar con `openssl rand -hex 32`)
   - `DATABASE_PROVIDER=postgresql` + URL Postgres (Railway Postgres addon)
   - `DATABASE_CONNECTION_URI` — connection string Postgres
   - `SERVER_URL` — URL pública (p.ej. `https://evolution.esitef.com`)
3. CNAME `evolution.esitef.com` en SiteGround → Railway.
4. Crear instancia vía API o manager UI y escanear QR de WhatsApp.

### Opción B — VPS con Docker

```bash
docker pull evoapicloud/evolution-api:latest
docker run -d -p 8080:8080 --env-file evolution.env evoapicloud/evolution-api:latest
```

### Vincular WhatsApp (QR)

```bash
curl -X POST "https://evolution.esitef.com/instance/create" \
  -H "apikey: TU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"instanceName": "esitef", "qrcode": true, "integration": "WHATSAPP-BAILEYS"}'
```

Abrir el QR devuelto en la respuesta o en el manager de Evolution. El número queda vinculado.

## 3. Conectar Evolution API ↔ Chatwoot

Evolution crea la inbox de WhatsApp en Chatwoot automáticamente (`autoCreate: true`).

1. En Chatwoot: **Settings → Integrations → API** → copiar **Account ID** y crear **Access Token** (usuario admin).
2. Configurar Evolution:

```bash
curl -X POST "https://evolution.esitef.com/chatwoot/set/esitef" \
  -H "apikey: TU_EVOLUTION_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "accountId": "1",
    "token": "TU_CHATWOOT_API_TOKEN",
    "url": "https://chat.esitef.com",
    "signMsg": true,
    "reopenConversation": true,
    "nameInbox": "WhatsApp ESITEF",
    "mergeBrazilContacts": false,
    "importContacts": true,
    "importMessages": true,
    "daysLimitImportMessages": 3,
    "autoCreate": true,
    "organization": "ESITEF"
  }'
```

3. Verificar en Chatwoot: **Settings → Inboxes** → inbox **WhatsApp ESITEF** creada.
4. Probar: enviar WhatsApp al número vinculado → conversación en Chatwoot.

**ponytail:** número normal de WhatsApp vía Baileys puede ser bloqueado por Meta con volumen alto de salida; upgrade path = WhatsApp Cloud API oficial sin cambiar Chatwoot.

## 4. Inbox Email (info@esitef.com)

1. Chatwoot → **Settings → Inboxes → Add Inbox → Email**.
2. Nombre: `Email ESITEF`, email: `info@esitef.com`.
3. Chatwoot genera una dirección de reenvío (p.ej. `reply+xxx@chatwoot.com` o similar según versión).
4. En SiteGround / cPanel del correo `info@esitef.com`:
   - Configurar **reenvío automático** de todos los mensajes entrantes a la dirección que Chatwoot indica.
   - O IMAP si prefieres pull (Chatwoot soporta ambos según canal).
5. Para **responder** desde Chatwoot: SMTP ya configurado en paso 1 con `MAILER_SENDER_EMAIL=info@esitef.com`.

## 5. Widget en app.esitef.com

1. Chatwoot → **Settings → Inboxes → Add Inbox → Website**.
2. Nombre: `ESITEF App`, dominio: `app.esitef.com`.
3. Copiar **Website Token**.
4. En Vercel (proyecto `esitef-web`) y `.env.local`:

```env
NEXT_PUBLIC_CHATWOOT_BASE_URL=https://chat.esitef.com
NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN=el_token_del_website_channel
CHATWOOT_BASE_URL=https://chat.esitef.com
CHATWOOT_API_TOKEN=el_access_token_de_integraciones
CHATWOOT_ACCOUNT_ID=1
```

El widget se carga solo si existen `NEXT_PUBLIC_CHATWOOT_BASE_URL` y `NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN`.

## 6. Sincronización de contactos (plataforma)

Tras cada compra de formación online pagada, `notify-course-purchase.ts` hace upsert del alumno en Chatwoot (idempotente, flag `chatwootContactSyncedAt` en `order.metadata`). Mismo patrón que Google Sheet.

## Verificación manual

1. Compra demo en local/producción → contacto con email del alumno en Chatwoot **Contacts**.
2. Widget visible en `app.esitef.com` (burbuja inferior).
3. Email a `info@esitef.com` → conversación en inbox Email.
4. WhatsApp al número vinculado → conversación en inbox WhatsApp.
5. Responder desde Chatwoot → llega al cliente por el canal correcto.

## Coste estimado

| Servicio | Coste |
|----------|-------|
| Chatwoot Railway | ~$5–15/mes |
| Evolution API Railway | ~$5/mes (o mismo VPS) |
| Resend SMTP | ya en uso |
