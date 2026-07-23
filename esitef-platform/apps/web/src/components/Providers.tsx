"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { hasAnalyticsConsent } from "@/lib/analytics-consent";
import { identifyUser, initPostHog, resetAnalyticsUser } from "@/lib/posthog";

function AnalyticsBootstrap() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (!hasAnalyticsConsent()) return;
    initPostHog();
  }, []);

  useEffect(() => {
    if (!hasAnalyticsConsent()) return;
    if (status === "authenticated" && session?.user?.id) {
      identifyUser(session.user.id);
      return;
    }
    if (status === "unauthenticated") {
      resetAnalyticsUser();
    }
  }, [session?.user?.id, status]);

  return <CookieConsentBanner />;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <AnalyticsBootstrap />
    </SessionProvider>
  );
}
