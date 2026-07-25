function consentSignalsFor(consent: "granted" | "analytics" | "denied") {
  if (consent === "granted") {
    return {
      analytics_storage: "granted",
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    } as const;
  }
  if (consent === "analytics") {
    return {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    } as const;
  }
  return {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  } as const;
}

function normalizeMetaEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeMetaPhone(phone: string) {
  return phone.replace(/\D/g, "");
}

async function hashMetaEmail(email: string) {
  const data = new TextEncoder().encode(normalizeMetaEmail(email));
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function parseAttributionCookie(raw?: string | null) {
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as Record<string, string>;
  } catch {
    return null;
  }
}

const granted = consentSignalsFor("granted");
if (granted.ad_storage !== "granted" || granted.analytics_storage !== "granted") {
  throw new Error("consent granted mapping failed");
}
const analytics = consentSignalsFor("analytics");
if (analytics.ad_storage !== "denied" || analytics.analytics_storage !== "granted") {
  throw new Error("consent analytics mapping failed");
}
if (normalizeMetaEmail("  Test@Email.COM ") !== "test@email.com") {
  throw new Error("email normalize failed");
}
if (normalizeMetaPhone("+54 9 3562 43-5884") !== "5493562435884") {
  throw new Error("phone normalize failed");
}
const parsed = parseAttributionCookie(
  encodeURIComponent(JSON.stringify({ gclid: "abc", utm_source: "google" }))
);
if (parsed?.gclid !== "abc" || parsed?.utm_source !== "google") {
  throw new Error("attribution parse failed");
}
const hash = await hashMetaEmail("test@email.com");
if (hash.length !== 64) {
  throw new Error("hash length failed");
}

console.log("tracking asserts ok");
