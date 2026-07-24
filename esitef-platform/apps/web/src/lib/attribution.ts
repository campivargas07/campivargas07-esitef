export const ATTRIBUTION_COOKIE = "esitef-attribution";

const TRACKING_PARAMS = [
  "gclid",
  "wbraid",
  "gbraid",
  "fbclid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export type AttributionTouch = Partial<
  Record<(typeof TRACKING_PARAMS)[number], string>
>;

export type CheckoutAttribution = AttributionTouch & {
  fbp?: string;
  fbc?: string;
  gaClientId?: string;
  gaSessionId?: string;
};

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`)
  );
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=7776000;SameSite=Lax`;
}

export function parseAttributionCookie(raw?: string | null): AttributionTouch | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as AttributionTouch;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function captureAttributionFromUrl() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const touch: AttributionTouch = {};
  for (const key of TRACKING_PARAMS) {
    const value = params.get(key)?.trim();
    if (value) touch[key] = value;
  }
  if (Object.keys(touch).length === 0) return;

  const existing = parseAttributionCookie(readCookie(ATTRIBUTION_COOKIE)) ?? {};
  writeCookie(ATTRIBUTION_COOKIE, JSON.stringify({ ...existing, ...touch }));
}

function parseGaCookie(): { clientId?: string; sessionId?: string } {
  const ga = readCookie("_ga");
  if (!ga) return {};
  const parts = ga.split(".");
  if (parts.length < 4) return {};
  const clientId = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;

  const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.replace(
    /^G-/,
    ""
  );
  let sessionId: string | undefined;
  if (measurementId) {
    const gaSession = readCookie(`_ga_${measurementId}`);
    if (gaSession) {
      const sessionParts = gaSession.split(".");
      if (sessionParts.length >= 3) {
        sessionId = sessionParts[2];
      }
    }
  }

  return { clientId, sessionId };
}

export function getCheckoutAttribution(): CheckoutAttribution {
  const touch =
    parseAttributionCookie(readCookie(ATTRIBUTION_COOKIE)) ?? {};
  const { clientId, sessionId } = parseGaCookie();
  return {
    ...touch,
    fbp: readCookie("_fbp") ?? undefined,
    fbc: readCookie("_fbc") ?? undefined,
    gaClientId: clientId,
    gaSessionId: sessionId,
  };
}
