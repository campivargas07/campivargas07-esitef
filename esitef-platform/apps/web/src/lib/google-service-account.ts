import { createSign } from "crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";

export type GoogleServiceAccountCreds = {
  client_email: string;
  private_key: string;
};

const tokenCaches = new Map<string, { token: string; expiresAt: number }>();

function base64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function getGoogleServiceAccount(): GoogleServiceAccountCreds | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GoogleServiceAccountCreds;
  } catch {
    return null;
  }
}

/** JWT bearer token for a Google API scope (cached per scope). */
export async function getGoogleAccessToken(scope: string): Promise<string> {
  const creds = getGoogleServiceAccount();
  if (!creds) throw new Error("Google service account no configurada");

  const now = Math.floor(Date.now() / 1000);
  const cached = tokenCaches.get(scope);
  if (cached && cached.expiresAt > now + 60) {
    return cached.token;
  }

  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iss: creds.client_email,
      scope,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  );
  const unsigned = `${header}.${payload}`;
  const sign = createSign("RSA-SHA256");
  sign.update(unsigned);
  sign.end();
  const signature = sign.sign(creds.private_key.replace(/\\n/g, "\n"));
  const jwt = `${unsigned}.${base64url(signature)}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    throw new Error(`Google token error: ${res.status}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  tokenCaches.set(scope, {
    token: data.access_token,
    expiresAt: now + data.expires_in,
  });
  return data.access_token;
}
