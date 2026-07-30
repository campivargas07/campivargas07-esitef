# Chatwoot — bandeja unificada Email + WhatsApp

Bandeja open source para atender **info@esitef.com** y **WhatsApp** desde un solo lugar. La plataforma sincroniza compradores como contactos y embebe el widget de chat en `esitef.com`.

**DNS de ESITEF:** SiteGround → **Site Tools → Domain → DNS Zone Editor** (zona `esitef.com`).

## Arquitectura

```
esitef.com (widget) ──► Chatwoot (chat.esitef.com)
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

El buzón **info@esitef.com** está en **SiteGround**, no en Google Workspace. **No uses OAuth de Gmail/Microsoft** para este inbox.

Resend (SMTP en paso 1) sirve para **enviar** desde Chatwoot; **no** sustituye la recepción del buzón SiteGround.

### Si no aparece “Email” al crear inbox (Add Inbox)

En instalaciones self-hosted (Railway, Docker, etc.) el canal **Email** suele venir **desactivado por cuenta** aunque SMTP esté bien. La tarjeta no sale o sale en gris (`inactive`).

**Requisitos previos**

1. Usuario con rol **Administrator** (no solo Agent).
2. Ruta: **Settings → Inboxes → Add Inbox** (no confundir con Integrations).
3. Migraciones al día tras deploy/upgrade (Railway, en el servicio Chatwoot):

```bash
bundle exec rails db:chatwoot_prepare
```

**Activar canal Email en la cuenta ESITEF (Railway)**

En el servicio Chatwoot → **Shell** / one-off command (o `railway shell`):

```bash
bundle exec rails runner "
  a = Account.find(1)
  flags = (Array(a.selected_feature_flags) + [:feature_channel_email, :feature_inbound_emails]).uniq
  a.update!(selected_feature_flags: flags)
  a.reload
  puts 'channel_email=' + a.feature_enabled?('channel_email').to_s
  puts 'inbound_emails=' + a.feature_enabled?('inbound_emails').to_s
"
```

Si la cuenta no es la `1`, lista IDs: `bundle exec rails runner "puts Account.pluck(:id, :name)"`.

Luego **cerrar sesión**, hard refresh (o borrar cookies de `chat.esitef.com`) y volver a **Add Inbox** → debe aparecer **Email**.

**Si sigue sin aparecer**

- Super Admin: `https://chat.esitef.com/super_admin` → Accounts → tu cuenta → **Clear cache** (tras upgrades).
- `FRONTEND_URL=https://chat.esitef.com` en Railway (sin barra final).
- No uses la opción **Google** ni **Microsoft** para `info@` (buzón SiteGround).

Referencia: [Email channel (self-hosted)](https://developers.chatwoot.com/self-hosted/configuration/features/email-channel/introduction), issue histórico [channel_email deshabilitado](https://github.com/chatwoot/chatwoot/issues/1785).

### Opción A — Reenvío (recomendada en SiteGround)

1. Chatwoot → **Settings → Inboxes → Add Inbox → Email**.
2. Nombre: `Email ESITEF`, email: `info@esitef.com`.
3. Inbox → **Configuration** → copiar **Forward to email** (dirección de ingress de Action Mailbox).
4. SiteGround → **Site Tools → Email → Forwarders** (o reenvío del buzón `info@`) → reenviar **todo** lo entrante a esa dirección.
5. En Railway (Chatwoot self-hosted), el ingress de correo entrante debe estar activo. Sin esto el reenvío no crea conversaciones. Ver [Email channel (self-hosted)](https://developers.chatwoot.com/self-hosted/configuration/features/email-channel/introduction) y [ingress providers](https://developers.chatwoot.com/self-hosted/configuration/features/email-channel/ingress-providers). Variables típicas según proveedor: `RAILS_INBOUND_EMAIL_SERVICE`, `MAILER_INBOUND_EMAIL_DOMAIN`.
6. **Responder** desde Chatwoot: SMTP global del paso 1 (`MAILER_SENDER_EMAIL=info@esitef.com`) o SMTP SiteGround en la inbox.

### Opción B — IMAP SiteGround (pull)

En la misma **Configuration** → **Enable IMAP configuration**:

| Campo | Valor típico |
|-------|----------------|
| IMAP host | `mail.esitef.com` (confirmar en Site Tools → Email → Mail Configuration) |
| Puerto | `993` (SSL) |
| Usuario | `info@esitef.com` |
| Contraseña | la del buzón |

SMTP salida (si no usas el mailer global): mismo host, puerto `465` SSL o `587` STARTTLS.

### Fallos frecuentes

- Usuario IMAP sin dominio (`info` en vez de `info@esitef.com`).
- Puerto o SSL incorrectos.
- OAuth de Google/Microsoft en un buzón que no es Workspace.
- Reenvío configurado pero **ingress** de Chatwoot sin variables en Railway.
- Solo SMTP de Resend configurado → puedes enviar, no recibir conversaciones del buzón.

### Prueba

Enviar un email de prueba a `info@esitef.com` → debe aparecer en la inbox **Email ESITEF** en Chatwoot en 1–2 minutos (IMAP) o casi al instante (reenvío + ingress OK).

## 5. Widget en esitef.com

1. Chatwoot → **Settings → Inboxes → Add Inbox → Website**.
2. Nombre: `ESITEF`, dominio: `esitef.com` (y `www.esitef.com` si aplica).
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

Tras cada compra de formación **online** o inscripción **presencial** pagada, la plataforma hace upsert del alumno en Chatwoot (idempotente, flag `chatwootContactSyncedAt` en `order.metadata`). Online → pestaña `Compras` en Google Sheet; presencial → pestaña `Presenciales`.

## Verificación manual

1. Compra demo en local/producción → contacto con email del alumno en Chatwoot **Contacts**.
2. Widget visible en `esitef.com` (burbuja inferior).
3. Email a `info@esitef.com` → conversación en inbox Email.
4. WhatsApp al número vinculado → conversación en inbox WhatsApp.
5. Responder desde Chatwoot → llega al cliente por el canal correcto.

## Coste estimado

| Servicio | Coste |
|----------|-------|
| Chatwoot Railway | ~$5–15/mes |
| Evolution API Railway | ~$5/mes (o mismo VPS) |
| Resend SMTP | ya en uso |
