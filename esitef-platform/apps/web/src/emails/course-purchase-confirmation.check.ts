/**
 * ponytail: course purchase confirmation React Email render smoke test.
 * Run: npx tsx src/emails/course-purchase-confirmation.check.ts
 */
import { CoursePurchaseConfirmationEmail } from "./course-purchase-confirmation";
import { renderEmailTemplate } from "@/lib/render-email";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

async function main() {
  const { html, text } = await renderEmailTemplate(
    CoursePurchaseConfirmationEmail({
      siteUrl: "https://app.esitef.com",
      userName: "María",
      courseTitle: "Club de Actualización",
      amountLabel: "149 €",
      paymentMethodLabel: "Tarjeta",
    })
  );

  assert(html.includes("Compra confirmada"), "eyebrow");
  assert(html.includes("Tu acceso está listo"), "heading");
  assert(html.includes("email-detail-box"), "detail box");
  assert(html.includes("Ir a mi formación"), "cta");
  assert(text.includes("ESITEF"), "plain text");

  console.log("course-purchase-confirmation.check.ts OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
