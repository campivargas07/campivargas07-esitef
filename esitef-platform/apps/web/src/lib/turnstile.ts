type SiteverifyResponse = {
  success: boolean;
  "error-codes"?: string[];
};

/**
 * Verifies a Cloudflare Turnstile token.
 * If TURNSTILE_SECRET_KEY is unset (local), returns true so honeypot + rate limit still apply.
 */
export async function verifyTurnstile(
  token: string | undefined,
  ip?: string
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return true;
  if (!token?.trim()) return false;

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token.trim());
  if (ip && ip !== "unknown") body.set("remoteip", ip);

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body }
    );
    const data = (await res.json()) as SiteverifyResponse;
    return data.success === true;
  } catch (err) {
    console.error("[turnstile]", err);
    return false;
  }
}

export function turnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim());
}
