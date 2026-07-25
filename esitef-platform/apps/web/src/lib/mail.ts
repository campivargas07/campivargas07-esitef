import { Resend } from "resend";

type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

/** HTTP headers (Authorization, etc.) must be ByteString — unicode in env vars crashes Resend. */
function toAsciiHeaderValue(value: string, label: string): string {
  const trimmed = value.trim();
  const ascii = trimmed.replace(/[^\x20-\x7E]/g, "");
  if (ascii.length !== trimmed.length) {
    console.error(
      `[mail:config] ${label} contains non-ASCII characters (e.g. copied from a doc with Cyrillic lookalikes). Re-paste in Vercel as plain ASCII.`
    );
  }
  return ascii;
}

function getMailFrom(): string {
  const raw =
    process.env.MAIL_FROM?.trim() || "ESITEF <noreply@esitef.com>";
  const from = toAsciiHeaderValue(raw, "MAIL_FROM");
  return from || "ESITEF <noreply@esitef.com>";
}

function getResendApiKey(): string | null {
  const raw = process.env.RESEND_API_KEY?.trim();
  if (!raw) return null;
  const key = toAsciiHeaderValue(raw, "RESEND_API_KEY");
  if (!key.startsWith("re_")) {
    console.error("[mail:config] RESEND_API_KEY invalid after sanitization");
    return null;
  }
  return key;
}

function getResendClient(): Resend | null {
  const apiKey = getResendApiKey();
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendMail(
  input: SendMailInput
): Promise<{ ok: boolean; error?: string }> {
  const to = input.to.trim();
  const from = getMailFrom();

  if (!to) {
    console.error("[mail:config] missing recipient");
    return { ok: false, error: "missing_recipient" };
  }

  let resend: Resend | null;
  try {
    resend = getResendClient();
  } catch (err) {
    console.error("[mail:resend] client init failed", err);
    return { ok: false, error: "resend_config" };
  }

  if (!resend) {
    console.info("[mail:dev]", {
      to,
      subject: input.subject,
      text: input.text.slice(0, 200),
    });
    return { ok: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    if (error) {
      console.error("[mail:resend]", {
        name: error.name,
        message: error.message,
        from,
        to,
      });
      return { ok: false, error: "resend_rejected" };
    }

    if (!data?.id) {
      console.error("[mail:resend] missing email id", { from, to });
      return { ok: false, error: "resend_rejected" };
    }

    return { ok: true };
  } catch (err) {
    console.error("[mail:resend]", err);
    return { ok: false, error: "resend_unreachable" };
  }
}

export { escapeHtml };
