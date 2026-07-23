export const ANALYTICS_CONSENT_COOKIE = "esitef-analytics-consent";

export type AnalyticsConsent = "granted" | "denied";

export function parseAnalyticsConsent(
  raw?: string | null
): AnalyticsConsent | null {
  if (raw === "granted" || raw === "denied") return raw;
  return null;
}

export function readAnalyticsConsentCookie(): AnalyticsConsent | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${ANALYTICS_CONSENT_COOKIE}=([^;]*)`)
  );
  return parseAnalyticsConsent(match?.[1] ? decodeURIComponent(match[1]) : null);
}

export function hasAnalyticsConsent(): boolean {
  return readAnalyticsConsentCookie() === "granted";
}

export function setAnalyticsConsent(consent: AnalyticsConsent) {
  document.cookie = `${ANALYTICS_CONSENT_COOKIE}=${encodeURIComponent(consent)};path=/;max-age=31536000;SameSite=Lax`;
}
