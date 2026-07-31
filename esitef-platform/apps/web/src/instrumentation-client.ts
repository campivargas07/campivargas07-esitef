import * as Sentry from "@sentry/nextjs";
import {
  getSentryDsn,
  getSentryEnvironment,
  getSentryTracesSampleRate,
  isSentryEnabled,
} from "@/lib/sentry";
import {
  SENTRY_DENY_URLS,
  SENTRY_IGNORE_ERRORS,
  shouldDropSentryClientEvent,
} from "@/lib/sentry-client";

if (isSentryEnabled()) {
  Sentry.init({
    dsn: getSentryDsn(),
    environment: getSentryEnvironment(),
    tracesSampleRate: getSentryTracesSampleRate(),
    enableLogs: true,
    ignoreErrors: SENTRY_IGNORE_ERRORS,
    denyUrls: SENTRY_DENY_URLS,
    beforeSend(event, hint) {
      return shouldDropSentryClientEvent(event, hint) ? null : event;
    },
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        maskAllInputs: true,
        blockAllMedia: true,
      }),
    ],
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
