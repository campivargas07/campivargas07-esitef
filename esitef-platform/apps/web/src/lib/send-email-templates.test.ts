/**
 * Envía todas las plantillas transaccionales a un correo de prueba.
 * Run: npx tsx --env-file=.env.local src/lib/send-email-templates.test.ts [email]
 */
import { NewsletterWelcomeEmail } from "@/emails/newsletter-welcome";
import { wrapTransactionalEmail } from "@/lib/email-html-wrapper";
import { sendMail } from "@/lib/mail";
import { renderEmailTemplate } from "@/lib/render-email";
import { getPublicSiteUrl } from "@/lib/site-url";

const TO = process.argv[2]?.trim() || "campivargas@gmail.com";
const PREFIX = "[TEST tema adaptativo]";

async function send(
  label: string,
  subject: string,
  html: string,
  text: string
) {
  const result = await sendMail({
    to: TO,
    subject: `${PREFIX} ${subject}`,
    html,
    text,
  });
  if (!result.ok) {
    throw new Error(`${label}: ${result.error ?? "send failed"}`);
  }
  console.log(`✓ ${label} → ${TO}`);
}

async function main() {
  if (!process.env.RESEND_API_KEY?.trim()) {
    throw new Error("RESEND_API_KEY missing — use: npx tsx --env-file=.env.local …");
  }

  const siteUrl = getPublicSiteUrl();

  const welcome = await renderEmailTemplate(
    NewsletterWelcomeEmail({ siteUrl })
  );
  await send(
    "newsletter-welcome",
    "Bienvenido al newsletter de ESITEF",
    welcome.html,
    welcome.text
  );

  const presencialInner = `
    <p>Hola Usuario de prueba,</p>
    <p>Tu inscripción presencial ha sido <strong>confirmada</strong>.</p>
    <ul>
      <li><strong>Formación:</strong> Formación Presencial Demo</li>
      <li><strong>Sede:</strong> Madrid</li>
      <li><strong>Plan:</strong> Pago único</li>
      <li><strong>Importe:</strong> 450 €</li>
    </ul>
    <p>Pago recibido correctamente.</p>
    <p><a class="email-link" href="${siteUrl}/dashboard">Ir a mi cuenta</a></p>
    <p>— Equipo ESITEF</p>
  `.trim();
  await send(
    "presencial-confirmation",
    "Confirmación de inscripción — Formación Presencial Demo",
    wrapTransactionalEmail(presencialInner),
    "Confirmación presencial (texto plano de prueba)."
  );

  await send(
    "contact",
    "Contacto web: Usuario de prueba",
    wrapTransactionalEmail(
      "<p><strong>Usuario de prueba</strong> &lt;prueba@esitef.com&gt;</p><p>Mensaje de prueba para verificar modo claro en clientes de correo.</p>"
    ),
    "De: Usuario de prueba <prueba@esitef.com>\n\nMensaje de prueba."
  );

  console.log(`\nEnviados 3 emails a ${TO}. Prueba con dark mode ON y OFF.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
