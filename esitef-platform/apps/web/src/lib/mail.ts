import { Resend } from "resend";

type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

function getMailFrom(): string {
  return process.env.MAIL_FROM?.trim() || "ESITEF <noreply@esitef.com>";
}

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
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

/** Resend SDK (package resend) — raw fetch fallaba en Vercel con resend_unreachable. */
export async function sendMail(
  input: SendMailInput
): Promise<{ ok: boolean; error?: string }> {
  const to = input.to.trim();
  const from = getMailFrom();

  if (!to) {
    console.error("[mail:config] missing recipient");
    return { ok: false, error: "missing_recipient" };
  }

  const resend = getResendClient();
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
