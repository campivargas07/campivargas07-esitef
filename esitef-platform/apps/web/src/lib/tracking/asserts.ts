import { consentSignalsFor } from "@/lib/gtm";
import {
  hashMetaEmail,
  normalizeMetaEmail,
  normalizeMetaPhone,
} from "@/lib/conversions/hash";
import { parseAttributionCookie } from "@/lib/attribution";

export function runTrackingAsserts() {
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
  if (hashMetaEmail("test@email.com").length !== 64) {
    throw new Error("hash length failed");
  }

  const parsed = parseAttributionCookie(
    encodeURIComponent(JSON.stringify({ gclid: "abc", utm_source: "google" }))
  );
  if (parsed?.gclid !== "abc" || parsed?.utm_source !== "google") {
    throw new Error("attribution parse failed");
  }
}
