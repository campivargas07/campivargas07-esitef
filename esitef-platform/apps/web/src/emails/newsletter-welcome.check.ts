/**
 * ponytail: render check for newsletter welcome template.
 * Run: npx tsx src/emails/newsletter-welcome.check.ts
 */
import { NewsletterWelcomeEmail } from "./newsletter-welcome";
import { renderEmailTemplate } from "@/lib/render-email";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

async function main() {
  const { html, text } = await renderEmailTemplate(
    NewsletterWelcomeEmail({ siteUrl: "https://app.esitef.com" })
  );

  assert(html.includes("Bienvenido al newsletter"), "html heading");
  assert(html.includes("Ver formaciones"), "html cta");
  assert(html.includes("Esitef_logo_icon_preloadeer.png"), "logo url");
  assert(html.includes('content="light dark"'), "adaptive color-scheme meta");
  assert(html.includes("prefers-color-scheme: dark"), "dark media query");
  assert(text.includes("ESITEF"), "plain text");

  console.log("newsletter-welcome.check.ts OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
