/**
 * ponytail: presencial confirmation React Email render smoke test.
 * Run: npx tsx src/emails/presencial-confirmation.check.ts
 */
import { PresencialConfirmationEmail } from "./presencial-confirmation";
import { renderEmailTemplate } from "@/lib/render-email";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

async function main() {
  const { html, text } = await renderEmailTemplate(
    PresencialConfirmationEmail({
      siteUrl: "https://app.esitef.com",
      userName: "Test",
      courseTitle: "Dolor y Movimiento",
      sede: "Madrid",
      planName: "Pago completo",
      amountLabel: "425 €",
      subscription: false,
    })
  );

  assert(html.includes("Inscripción confirmada"), "eyebrow");
  assert(html.includes("Tu plaza está reservada"), "heading");
  assert(html.includes("email-detail-box"), "detail box");
  assert(html.includes("Ir a mi cuenta"), "cta");
  assert(text.includes("ESITEF"), "plain text");

  console.log("presencial-confirmation.check.ts OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
