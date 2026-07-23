"use client";

import { useEffect, useState } from "react";
import {
  readAnalyticsConsentCookie,
  setAnalyticsConsent,
  type AnalyticsConsent,
} from "@/lib/analytics-consent";
import { initPostHog } from "@/lib/posthog";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readAnalyticsConsentCookie() === null);
  }, []);

  function choose(consent: AnalyticsConsent) {
    setAnalyticsConsent(consent);
    if (consent === "granted") initPostHog();
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
          Cookies de analítica
        </p>
        <p id="cookie-consent-desc" className="cookie-consent__text">
          Usamos cookies para medir el uso del sitio y mejorar la experiencia.
          Puedes aceptar o rechazar el seguimiento analítico.
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
            className="cookie-consent__btn cookie-consent__btn--primary"
            onClick={() => choose("granted")}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
