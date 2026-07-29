"use client";

import { useEffect } from "react";

const baseUrl = process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL?.trim();
const websiteToken = process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN?.trim();

declare global {
  interface Window {
    chatwootSDK?: {
      run: (opts: { websiteToken: string; baseUrl: string }) => void;
    };
  }
}

/** Loads Chatwoot website widget when public env vars are set. */
export function ChatwootWidget() {
  useEffect(() => {
    if (!baseUrl || !websiteToken) return;

    const normalizedBase = baseUrl.replace(/\/$/, "");
    const script = document.createElement("script");
    script.async = true;
    script.src = `${normalizedBase}/packs/js/sdk.js`;
    script.onload = () => {
      window.chatwootSDK?.run({
        websiteToken,
        baseUrl: normalizedBase,
      });
    };
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
}
