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
export async function sendMail(input: SendMailInput): Promise<{ ok: boolean }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.MAIL_FROM?.trim() || "ESITEF <noreply@esitef.com>";

  if (!apiKey) {
    console.info("[mail:dev]", {
      to: input.to,
      subject: input.subject,
      text: input.text.slice(0, 200),
    });
    return { ok: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[mail:resend]", res.status, body.slice(0, 300));
    return { ok: false };
  }

  return { ok: true };
}
