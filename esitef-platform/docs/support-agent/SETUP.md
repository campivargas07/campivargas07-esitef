# Agente de soporte ESITEF (Email → Gemini → /admin/inbox)

Bandeja propia en `esitef-platform` (sin Chatwoot). Fase 1: solo Email. WhatsApp queda fuera.

## Flujo

1. Email a la dirección inbound de Resend (o forward de `info@esitef.com`).
2. Resend dispara webhook `email.received` → `POST https://esitef.com/api/webhooks/resend`.
3. La app guarda la conversación, llama a Gemini (si hay `GEMINI_API_KEY`) y responde por Resend, o escala a humano.
4. Humanos atienden en `/admin/inbox`.

## Variables (Vercel + `.env.local`)

| Variable | Uso |
|---|---|
| `RESEND_API_KEY` | Ya en uso (envío + receiving.get) |
| `RESEND_WEBHOOK_SECRET` | Signing secret `whsec_…` del webhook Resend |
| `SUPPORT_MAIL_FROM` | Remitente de respuestas (ej. `ESITEF <info@esitef.com>`) |
| `SUPPORT_NOTIFY_EMAIL` | Aviso interno al escalar (default `CONTACT_EMAIL`) |
| `GEMINI_API_KEY` | Free tier Google AI Studio |
| `GEMINI_MODEL` | Opcional, default `gemini-2.5-flash` |

## Alta en Resend

1. [Receiving](https://resend.com/emails/receiving): dominio o dirección inbound.
2. Si `info@` sigue en SiteGround: **Site Tools → Email → Forwarders** → reenviar a la dirección inbound de Resend (o MX del subdominio de recepción según la guía de Resend).
3. [Webhooks](https://resend.com/webhooks): URL `https://esitef.com/api/webhooks/resend`, evento `email.received`. Guardar el signing secret en `RESEND_WEBHOOK_SECRET`.

## Schema

Tras pull: `cd esitef-platform && npm run db:push` (tablas `support_conversations`, `support_messages`).

## Verificación

```bash
cd apps/web && npx tsx src/lib/support-agent.check.ts
```

Enviar un email de prueba → debe aparecer en `/admin/inbox`. Mensaje “quiero hablar con una persona” → estado `needs_human` + email a `SUPPORT_NOTIFY_EMAIL`.
