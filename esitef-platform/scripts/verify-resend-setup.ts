#!/usr/bin/env tsx
/**
 * Verifica RESEND_API_KEY + MAIL_FROM (envío opcional).
 * Usage: npm run verify:resend
 * Live send: VERIFY_RESEND_SEND=1 npm run verify:resend
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Resend } from "resend";

const ROOT = join(import.meta.dirname, "..");

function hasNonAscii(value: string): boolean {
  return /[^\x20-\x7E]/.test(value);
}

function loadEnvLocal() {
  const path = join(ROOT, "apps/web/.env.local");
  try {
    const raw = readFileSync(path, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const i = trimmed.indexOf("=");
      if (i === -1) continue;
      const key = trimmed.slice(0, i).trim();
      let value = trimmed.slice(i + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    console.warn("No se encontró apps/web/.env.local — usa variables de entorno o créalo desde .env.example");
  }
}

async function main() {
  loadEnvLocal();

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.MAIL_FROM?.trim() || "ESITEF <noreply@esitef.com>";
  const to =
    process.env.CONTACT_EMAIL?.trim() ||
    process.env.NEWSLETTER_EMAIL?.trim() ||
    "info@esitef.com";

  if (!apiKey?.startsWith("re_")) {
    throw new Error(
      "RESEND_API_KEY ausente o inválida (debe empezar con re_). " +
        "Añádela en apps/web/.env.local o exporta RESEND_API_KEY=re_... antes de ejecutar."
    );
  }

  if (hasNonAscii(apiKey)) {
    throw new Error(
      "RESEND_API_KEY contiene caracteres no ASCII (comillas tipográficas o letras cirílicas al copiar). " +
        "En Vercel: borra la variable, pega la clave de nuevo desde Resend (solo teclado ASCII) y redeploy."
    );
  }

  if (hasNonAscii(from)) {
    throw new Error(
      "MAIL_FROM contiene caracteres no ASCII. Usa: ESITEF <noreply@esitef.com> (sin comillas raras)."
    );
  }

  if (!from.includes("@")) {
    throw new Error("MAIL_FROM debe incluir un email, ej. ESITEF <noreply@esitef.com>");
  }

  const resend = new Resend(apiKey);

  if (process.env.VERIFY_RESEND_SEND !== "1") {
    console.log("✓ RESEND_API_KEY presente");
    console.log(`✓ MAIL_FROM=${from}`);
    console.log(`  Para envío real: VERIFY_RESEND_SEND=1 npm run verify:resend (to=${to})`);
    return;
  }

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject: "ESITEF — prueba Resend",
    text: "Correo de verificación desde verify-resend-setup.ts",
    html: "<p>Correo de verificación desde <code>verify-resend-setup.ts</code></p>",
  });

  if (error) {
    throw new Error(`Resend rechazó el envío: ${error.name} — ${error.message}`);
  }

  console.log(`✓ Email enviado (id=${data?.id}) a ${to}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
