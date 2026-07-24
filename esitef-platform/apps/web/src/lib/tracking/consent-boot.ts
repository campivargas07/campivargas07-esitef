import type { AnalyticsConsent } from "@/lib/analytics-consent";
import { consentSignalsFor } from "@/lib/gtm";

export function buildConsentDefaultScript(consent: AnalyticsConsent | null) {
  const signals = consentSignalsFor(consent ?? "denied");
  return `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("consent","default",${JSON.stringify({ ...signals, wait_for_update: 500 })});gtag("set","linker",{"domains":["esitef.com","www.esitef.com","app.esitef.com"]});`;
}
