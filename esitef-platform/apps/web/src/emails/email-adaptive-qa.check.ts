/**
 * ponytail: React Email templates must ship adaptive light fallback + dark media.
 * Run: npx tsx src/emails/email-adaptive-qa.check.ts
 */
import assert from "node:assert/strict";
import { NewsletterWelcomeEmail } from "./newsletter-welcome";
import { PasswordResetEmail } from "./password-reset";
import { emailTheme } from "@/lib/email-theme";
import { renderEmailTemplate } from "@/lib/render-email";

const { light } = emailTheme;
const siteUrl = "https://app.esitef.com";

function assertAdaptiveEmail(html: string, label: string) {
  assert(html.includes("prefers-color-scheme: dark"), `${label}: dark media query`);
  assert(html.includes(emailTheme.dark.shell), `${label}: dark shell token`);
  assert(html.includes(light.shell), `${label}: light fallback inline`);
  assert(html.includes("email-logo-light"), `${label}: logo light class`);
  assert(html.includes("email-logo-dark"), `${label}: logo dark class`);
  assert(html.includes("Esitef_logo_icon_dark.png"), `${label}: dark logo asset`);
  assert(
    html.includes(`background-color:${light.brand}`) ||
      html.includes(`background-color: ${light.brand}`),
    `${label}: CTA brand red (light fallback)`
  );
}

async function main() {
  const welcome = await renderEmailTemplate(
    NewsletterWelcomeEmail({ siteUrl })
  );
  assertAdaptiveEmail(welcome.html, "newsletter-welcome");

  const reset = await renderEmailTemplate(
    PasswordResetEmail({
      siteUrl,
      userName: "Test",
      resetUrl: `${siteUrl}/ingresar/restablecer?token=qa`,
    })
  );
  assertAdaptiveEmail(reset.html, "password-reset");

  console.log("email-adaptive-qa.check.ts OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
