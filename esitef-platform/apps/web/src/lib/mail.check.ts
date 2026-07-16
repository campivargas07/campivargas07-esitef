/**
 * ponytail: dev-mode mailer must not fail without RESEND_API_KEY.
 * Run: npx tsx src/lib/mail.check.ts
 */
import { sendMail } from "./mail";

async function main() {
  const prev = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;

  const result = await sendMail({
    to: "test@example.com",
    subject: "Smoke presencial",
    text: "Confirmación de inscripción presencial (dev log).",
    html: "<p>Confirmación de inscripción presencial (dev log).</p>",
  });

  if (!result.ok) throw new Error("sendMail must return ok in dev mode");

  if (prev) process.env.RESEND_API_KEY = prev;

  console.log("mail.check.ts OK — sin RESEND_API_KEY loguea [mail:dev]");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
