/**
 * ponytail: RESEND_API_KEY must be ASCII-only (unicode breaks Authorization on Vercel).
 * Run: npx tsx apps/web/src/lib/mail.check.ts
 */
import { sendMail } from "./mail";

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

  // Cyrillic "е" (U+0435) — same class of bug seen in production at index 26
  process.env.RESEND_API_KEY = `re_abcdefghijklmnopqr${"\u0435"}tuvwxyz`;
  process.env.MAIL_FROM = "ESITEF <noreply@esitef.com>";

  const badKey = await sendMail({
    to: "test@example.com",
    subject: "Smoke",
    text: "x",
    html: "<p>x</p>",
  });
  if (badKey.ok || badKey.error !== "resend_config") {
    throw new Error(`expected resend_config, got ${JSON.stringify(badKey)}`);
  }

  if (prevKey) process.env.RESEND_API_KEY = prevKey;
  else delete process.env.RESEND_API_KEY;
  if (prevFrom) process.env.MAIL_FROM = prevFrom;
  else delete process.env.MAIL_FROM;

  console.log("mail.check.ts OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
