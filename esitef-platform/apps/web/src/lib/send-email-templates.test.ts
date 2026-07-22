/**
 * Envía plantillas transaccionales rediseñadas a un correo de prueba.
 * Run: npx tsx --env-file=.env.local src/lib/send-email-templates.test.ts [email]
 */
import { NewsletterWelcomeEmail } from "@/emails/newsletter-welcome";
import { PresencialConfirmationEmail } from "@/emails/presencial-confirmation";
import {
  emailDetailBoxHtml,
  emailEyebrowHtml,
  emailHeadingHtml,
  emailParagraphHtml,
} from "@/lib/email-html-blocks";
import { wrapTransactionalEmail } from "@/lib/email-html-wrapper";
import { sendMail } from "@/lib/mail";
import { renderEmailTemplate } from "@/lib/render-email";
import { getPublicSiteUrl } from "@/lib/site-url";

const TO = process.argv[2]?.trim() || "campivargas@gmail.com";
const PREFIX = "[TEST diseño v2]";

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

  const presencial = await renderEmailTemplate(
    PresencialConfirmationEmail({
      siteUrl,
      userName: "Usuario de prueba",
      courseTitle: "Dolor y Movimiento",
      sede: "Madrid",
      planName: "Pago completo",
      amountLabel: "425 €",
      subscription: false,
    })
  );
  await send(
    "presencial-confirmation",
    "Confirmación de inscripción — Dolor y Movimiento",
    presencial.html,
    presencial.text
  );

  const contactInner = [
    emailEyebrowHtml("Contacto web"),
    emailHeadingHtml("Mensaje de Usuario de prueba"),
    emailParagraphHtml(
      "Has recibido un nuevo mensaje desde el formulario de contacto."
    ),
    emailDetailBoxHtml([
      { label: "Nombre", value: "Usuario de prueba" },
      { label: "Email", value: "prueba@esitef.com" },
      {
        label: "Mensaje",
        value: "Mensaje de prueba del nuevo diseño de plantillas.",
      },
    ]),
  ].join("");
  await send(
    "contact",
    "Contacto web: Usuario de prueba",
    wrapTransactionalEmail(contactInner, siteUrl),
    "De: Usuario de prueba <prueba@esitef.com>\n\nMensaje de prueba."
  );

  console.log(`\nEnviados 3 emails a ${TO}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
