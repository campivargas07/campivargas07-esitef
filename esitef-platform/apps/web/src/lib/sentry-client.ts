import type { ErrorEvent, EventHint } from "@sentry/nextjs";

/** Client-side noise: GTM/Pixel, WebViews, extensions, Turnstile dev. */
export const SENTRY_IGNORE_ERRORS: Array<string | RegExp> = [
  /fbq is not defined/i,
  /Can't find variable: fbq/i,
  /webkit\.messageHandlers/i,
  /Java object is gone/i,
  /Object Not Found Matching Id/i,
  /jQuery is not defined/i,
  /\$ is not defined/i,
  /Converting circular structure to JSON/i,
  /TurnstileError.*110200/i,
  /ContactDock is not defined/i,
  /\buc is not defined/i,
  /Cannot access 'capturePayment' before initialization/i,
  /Cannot access 'createPayPalOrder' before initialization/i,
];

export const SENTRY_DENY_URLS: Array<string | RegExp> = [
  /googletagmanager\.com/i,
  /gtm\.js/i,
  /chrome-extension:/i,
  /moz-extension:/i,
  /turnstile\/v0\/api\.js/i,
];

const THIRD_PARTY_FRAME =
  /gtm\.js|googletagmanager|chrome-extension|moz-extension|turnstile\/v0|extensions\//i;

function eventMessage(event: ErrorEvent): string {
  const fromException = event.exception?.values?.[0]?.value;
  if (fromException) return fromException;
  return typeof event.message === "string" ? event.message : "";
}

function isThirdPartyOnlyStack(event: ErrorEvent): boolean {
  const frames = event.exception?.values?.[0]?.stacktrace?.frames ?? [];
  if (frames.length === 0) return false;

  return frames.every((frame) => {
    const file = frame.filename ?? frame.abs_path ?? "";
    if (!file) return true;
    if (THIRD_PARTY_FRAME.test(file)) return true;
    if (file === "<anonymous>") return true;
    return false;
  });
}

export function shouldDropSentryClientEvent(
  event: ErrorEvent,
  hint: EventHint
): boolean {
  const env = event.environment ?? process.env.NODE_ENV ?? "development";
  const message = eventMessage(event);

  if (env !== "production" && /TurnstileError.*110200/i.test(message)) {
    return true;
  }

  if (/fbq is not defined|Can't find variable: fbq/i.test(message)) {
    return true;
  }

  if (isThirdPartyOnlyStack(event)) {
    return true;
  }

  const original = hint.originalException;
  if (original instanceof Error && /fbq is not defined/i.test(original.message)) {
    return true;
  }

  return false;
}
