import { Resend } from "resend";

type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

/**
 * Headers HTTP must be ByteString. A single Cyrillic lookalike in the API key
 * (char code 1077 = "е") crashes Resend on Vercel — never strip-and-send.
 */
function assertAsciiEnv(value: string, label: string): string | null {
  const trimmed = value.trim();
  for (let i = 0; i < trimmed.length; i++) {
    const code = trimmed.charCodeAt(i);
    if (code < 0x20 || code > 0x7e) {
      console.error(
        `[mail:config] ${label} has non-ASCII at index ${i} (code=${code}). ` +
          `Delete the Vercel env var, create a NEW key in Resend, paste once, redeploy.`
      );
      return null;
    }
  }
  return trimmed;
}

function getMailFrom(): string | null {
  const raw =
    process.env.MAIL_FROM?.trim() || "ESITEF <noreply@esitef.com>";
  return assertAsciiEnv(raw, "MAIL_FROM");
}

function getResendApiKey(): string | null {
  const raw = process.env.RESEND_API_KEY?.trim();
  if (!raw) return null;
  const key = assertAsciiEnv(raw, "RESEND_API_KEY");
  if (!key) return null;
  if (!key.startsWith("re_")) {
    console.error("[mail:config] RESEND_API_KEY must start with re_");
    return null;
  }
  return key;
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
  if (!to) {
    console.error("[mail:config] missing recipient");
    return { ok: false, error: "missing_recipient" };
  }

  const apiKey = getResendApiKey();
  if (!apiKey) {
    if (!process.env.RESEND_API_KEY?.trim()) {
      console.info("[mail:dev]", {
        to,
        subject: input.subject,
        text: input.text.slice(0, 200),
      });
      return { ok: true };
    }
    return { ok: false, error: "resend_config" };
  }

  const from = getMailFrom();
  if (!from) {
    return { ok: false, error: "resend_config" };
  }

  try {
    const resend = new Resend(apiKey);
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
