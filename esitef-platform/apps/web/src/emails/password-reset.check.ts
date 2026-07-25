/**
 * ponytail: password reset React Email render smoke test.
 * Run: npx tsx src/emails/password-reset.check.ts
 */
import { PasswordResetEmail } from "./password-reset";
import { renderEmailTemplate } from "@/lib/render-email";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

async function main() {
  const { html, text } = await renderEmailTemplate(
    PasswordResetEmail({
      siteUrl: "https://esitef.com",
      userName: "Test",
      resetUrl: "https://esitef.com/ingresar/restablecer?token=abc",
    })
  );

  assert(html.includes("Restablecer contraseña"), "heading");
  assert(html.includes("Elegir nueva contraseña"), "cta");
  assert(text.includes("ESITEF"), "plain text");

  console.log("password-reset.check.ts OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
