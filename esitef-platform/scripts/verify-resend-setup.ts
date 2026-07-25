/**
 * Verifica RESEND_API_KEY + MAIL_FROM con un envío de prueba (dry-run opcional).
 * Run: npx tsx --env-file=apps/web/.env.local scripts/verify-resend-setup.ts
 * Live send: VERIFY_RESEND_SEND=1 npx tsx --env-file=apps/web/.env.local scripts/verify-resend-setup.ts
 */
import { Resend } from "resend";

async function main() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.MAIL_FROM?.trim() || "ESITEF <noreply@esitef.com>";
  const to =
    process.env.CONTACT_EMAIL?.trim() ||
    process.env.NEWSLETTER_EMAIL?.trim() ||
    "info@esitef.com";

  if (!apiKey?.startsWith("re_")) {
    throw new Error("RESEND_API_KEY ausente o inválida (debe empezar con re_)");
  }

  if (!from.includes("@")) {
    throw new Error("MAIL_FROM debe incluir un email, ej. ESITEF <noreply@esitef.com>");
  }

  const resend = new Resend(apiKey);

  if (process.env.VERIFY_RESEND_SEND !== "1") {
    console.log("✓ RESEND_API_KEY presente");
    console.log(`✓ MAIL_FROM=${from}`);
    console.log(`  Para envío real: VERIFY_RESEND_SEND=1 … (to=${to})`);
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
