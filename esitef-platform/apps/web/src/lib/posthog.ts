import posthog from "posthog-js";
import { hasAnalyticsConsent } from "@/lib/analytics-consent";

let initialized = false;

function getPostHogKey() {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY || "";
}

function getPostHogHost() {
  return process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";
}

export function isPostHogConfigured() {
  return Boolean(getPostHogKey());
}

export function initPostHog() {
  if (typeof window === "undefined") return;
  if (!isPostHogConfigured() || !hasAnalyticsConsent() || initialized) return;

  posthog.init(getPostHogKey(), {
    api_host: getPostHogHost(),
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
    persistence: "localStorage+cookie",
    autocapture: false,
  });
  initialized = true;
}

export function identifyUser(userId: string) {
  if (!hasAnalyticsConsent() || !initialized) return;
  posthog.identify(userId);
}

export function resetAnalyticsUser() {
  if (!initialized) return;
  posthog.reset();
}

export function captureEvent(
  event: string,
  properties?: Record<string, string | number | boolean | null>
) {
  if (!hasAnalyticsConsent() || !initialized) return;
  posthog.capture(event, properties);
}
