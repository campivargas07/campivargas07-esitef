import {
  readAnalyticsConsentCookie,
  setAnalyticsConsent,
  type AnalyticsConsent,
} from "@/lib/analytics-consent";
import { initPostHog } from "@/lib/posthog";
import { updateConsent } from "@/lib/gtm";
import Link from "next/link";
import { useEffect, useState } from "react";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readAnalyticsConsentCookie() === null);
  }, []);

  function choose(consent: AnalyticsConsent) {
    setAnalyticsConsent(consent);
    updateConsent(consent);
    if (consent === "granted" || consent === "analytics") initPostHog();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="cookie-consent"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
    >
      <div className="cookie-consent__inner">
        <p id="cookie-consent-title" className="cookie-consent__title">
          Cookies y medición
        </p>
        <p id="cookie-consent-desc" className="cookie-consent__text">
          Usamos cookies de analítica y publicidad para medir campañas y mejorar
          la experiencia. Puedes aceptar todo, solo analítica esencial o rechazar
          el seguimiento.{" "}
          <Link href="/privacidad">Política de privacidad</Link>.
        </p>
        <div className="cookie-consent__actions">
          <button
            type="button"
            className="cookie-consent__btn cookie-consent__btn--secondary"
            onClick={() => choose("denied")}
          >
            Rechazar
          </button>
          <button
            type="button"
            className="cookie-consent__btn cookie-consent__btn--secondary"
            onClick={() => choose("analytics")}
          >
            Solo analítica
          </button>
          <button
            type="button"
            className="cookie-consent__btn cookie-consent__btn--primary"
            onClick={() => choose("granted")}
          >
            Aceptar todo
          </button>
        </div>
      </div>
    </div>
  );
}
