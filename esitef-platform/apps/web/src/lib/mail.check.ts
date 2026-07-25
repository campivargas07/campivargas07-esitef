/**
 * ponytail: RESEND_API_KEY must be ASCII-only (unicode breaks Authorization header on Vercel).
 * Run: npx tsx apps/web/src/lib/mail.check.ts
 */
import { sendMail } from "./mail";

function hasNonAscii(value: string): boolean {
  return /[^\x20-\x7E]/.test(value);
}

async function main() {
  const prevKey = process.env.RESEND_API_KEY;
  const prevFrom = process.env.MAIL_FROM;

  delete process.env.RESEND_API_KEY;

  const dev = await sendMail({
    to: "test@example.com",
    subject: "Smoke",
    text: "dev",
    html: "<p>dev</p>",
  });
  if (!dev.ok) throw new Error("sendMail must return ok without RESEND_API_KEY");

  process.env.RESEND_API_KEY = "re_test" + "\u0435" + "fake";
  process.env.MAIL_FROM = "ESITEF <noreply@esitef.com>";

  const badKey = await sendMail({
    to: "test@example.com",
    subject: "Smoke",
    text: "x",
    html: "<p>x</p>",
  });
  if (badKey.ok) {
    throw new Error("expected failure when API key contains non-ASCII after sanitize");
  }

  if (prevKey) process.env.RESEND_API_KEY = prevKey;
  else delete process.env.RESEND_API_KEY;
  if (prevFrom) process.env.MAIL_FROM = prevFrom;
  else delete process.env.MAIL_FROM;

  if (prevKey && hasNonAscii(prevKey)) {
    console.warn(
      "WARN: RESEND_API_KEY in env has non-ASCII — re-paste in Vercel as plain ASCII"
    );
  }

  console.log("mail.check.ts OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
