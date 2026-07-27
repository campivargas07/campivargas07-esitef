/**
 * ponytail: render check for libros promo campaign template (design preview only).
 * Run: npx tsx src/emails/libros-promo.check.ts
 */
import { LibrosPromoEmail } from "./libros-promo";
import { renderEmailTemplate } from "@/lib/render-email";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

async function main() {
  const { html, text } = await renderEmailTemplate(
    LibrosPromoEmail({
      siteUrl: "https://esitef.com",
      userName: "Test",
      books: [
        {
          title: "DOLOR",
          href: "https://esitef.com/descarga-libro-dolor",
        },
        {
          title: "Fisioterapia desde y para el movimiento",
          href: "https://esitef.com/descarga-libro",
        },
      ],
    })
  );

  assert(html.includes("Biblioteca gratuita"), "eyebrow");
  assert(html.includes("Potencia tu práctica clínica"), "heading");
  assert(html.includes("Descargar gratis"), "book link");
  assert(html.includes("Ver formaciones en esitef.com"), "cta");
  assert(html.includes("/formaciones"), "formaciones link");
  assert(text.includes("ESITEF"), "plain text");

  console.log("libros-promo.check.ts OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
