"use client";

import { useEffect } from "react";
import { captureAttributionFromUrl } from "@/lib/attribution";
import {
  hasMarketingConsent,
  readAnalyticsConsentCookie,
} from "@/lib/analytics-consent";
import { isGtmConfigured, updateConsent } from "@/lib/gtm";

export function AttributionBootstrap() {
  useEffect(() => {
    captureAttributionFromUrl();
    const consent = readAnalyticsConsentCookie();
    if (consent) updateConsent(consent);
  }, []);

  useEffect(() => {
    if (!isGtmConfigured() || !hasMarketingConsent()) return;
    pushPageView();
  }, []);

  return null;
}

function pushPageView() {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event: "page_view",
    page_path: window.location.pathname,
    page_title: document.title,
  });
}
