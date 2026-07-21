type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

/**
 * Minimal mailer — Resend HTTP API if RESEND_API_KEY is set; otherwise logs.
 * ponytail: no nodemailer dep; upgrade to SDK when volume grows.
 */
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
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.MAIL_FROM?.trim() || "ESITEF <noreply@esitef.com>";
  const to = input.to.trim();

  if (!to) {
    console.error("[mail:config] missing recipient");
    return { ok: false, error: "missing_recipient" };
  }

  if (!apiKey) {
    console.info("[mail:dev]", {
      to,
      subject: input.subject,
      text: input.text.slice(0, 200),
    });
    return { ok: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[mail:resend]", res.status, body.slice(0, 300));
      return { ok: false, error: "resend_rejected" };
    }

    return { ok: true };
  } catch (err) {
    console.error("[mail:fetch]", err);
    return { ok: false, error: "resend_unreachable" };
  }
}

export { escapeHtml };
