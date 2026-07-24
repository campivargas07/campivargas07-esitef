import {
  hasMarketingConsent,
} from "@/lib/analytics-consent";
import type { AnalyticsConsent } from "@/lib/analytics-consent";

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";
export const GA4_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? "";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function isGtmConfigured() {
  return Boolean(GTM_ID);
}

function ensureDataLayer() {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
}

export function pushEvent(
  event: string,
  params?: Record<string, string | number | boolean | null | undefined>
) {
  if (typeof window === "undefined") return;
  ensureDataLayer();
  const payload: Record<string, unknown> = { event, ...params };
  window.dataLayer!.push(payload);
}

type ConsentSignals = {
  analytics_storage: "granted" | "denied";
  ad_storage: "granted" | "denied";
  ad_user_data: "granted" | "denied";
  ad_personalization: "granted" | "denied";
};

export function consentSignalsFor(
  consent: AnalyticsConsent
): ConsentSignals {
  if (consent === "granted") {
    return {
      analytics_storage: "granted",
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    };
  }
  if (consent === "analytics") {
    return {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    };
  }
  return {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  };
}

export function updateConsent(consent: AnalyticsConsent) {
  if (typeof window === "undefined") return;
  ensureDataLayer();
  const signals = consentSignalsFor(consent);
  window.gtag?.("consent", "update", signals);
  pushEvent("consent_update", { consent });
}

export function canPushMarketingEvent() {
  return hasMarketingConsent();
}
