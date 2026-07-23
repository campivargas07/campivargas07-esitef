export function getSentryDsn() {
  return process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || "";
}

export function isSentryEnabled() {
  return Boolean(getSentryDsn());
}

export function getSentryEnvironment() {
  return process.env.VERCEL_ENV || process.env.NODE_ENV || "development";
}

export function getSentryTracesSampleRate() {
  return process.env.NODE_ENV === "development" ? 1 : 0.1;
}
