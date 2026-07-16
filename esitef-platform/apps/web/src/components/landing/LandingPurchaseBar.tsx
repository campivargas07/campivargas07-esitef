"use client";

import Link from "next/link";
import { useState } from "react";
import { readJsonResponse } from "@/lib/read-json-response";
import {
  formatOnlineMoney,
  type OnlineCurrency,
} from "@/lib/online-currency";

type Props = {
  courseSlug: string;
  priceCents: number;
  currency: OnlineCurrency;
  enrolled: boolean;
  isLoggedIn: boolean;
  showPayPal: boolean;
};

type LoadingMethod = "stripe" | "paypal" | null;

export function LandingPurchaseBar({
  courseSlug,
  priceCents,
  currency,
  enrolled,
  isLoggedIn,
  showPayPal,
}: Props) {
  const [loading, setLoading] = useState<LoadingMethod>(null);
  const loginUrl = `/ingresar?callbackUrl=${encodeURIComponent(`/cursos/${courseSlug}`)}`;

  async function checkout(method: "stripe" | "paypal") {
    setLoading(method);
    try {
      const endpoint =
        method === "paypal" ? "/api/checkout/paypal" : "/api/checkout/stripe";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug, currency }),
      });
      const data = await readJsonResponse<{ url?: string; error?: string; message?: string }>(res);
      if (!res.ok) {
        alert(data.error ?? data.message ?? `Error ${res.status}`);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      alert(data.message ?? "No se pudo iniciar el pago.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div
      className={`landing-purchase-bar${showPayPal ? " landing-purchase-bar--paypal" : ""}`}
    >
      <div className="landing-enroll-wrap">
        {enrolled ? (
          <Link
            href={`/aprender/${courseSlug}`}
            className="hero-btn landing-cta-btn"
          >
            Ir al curso
          </Link>
        ) : (
          <>
            {priceCents > 0 && (
              <div className="price tutor-course-price">
                {formatOnlineMoney(priceCents, currency)}
              </div>
            )}
            {isLoggedIn ? (
              <div className="landing-enroll-actions">
                {showPayPal ? (
                  <>
                    <button
                      type="button"
                      className="hero-btn landing-cta-btn tutor-btn-primary landing-cta-btn--paypal"
                      onClick={() => checkout("paypal")}
                      disabled={loading !== null}
                    >
                      {loading === "paypal" ? "Redirigiendo…" : "Pagar con PayPal"}
                    </button>
                    <button
                      type="button"
                      className="hero-btn landing-cta-btn landing-cta-btn--card"
                      onClick={() => checkout("stripe")}
                      disabled={loading !== null}
                    >
                      {loading === "stripe" ? "Redirigiendo…" : "Pagar con tarjeta"}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="hero-btn landing-cta-btn tutor-btn-primary"
                    onClick={() => checkout("stripe")}
                    disabled={loading !== null}
                  >
                    {loading === "stripe" ? "Redirigiendo…" : "Inscribirme"}
                  </button>
                )}
              </div>
            ) : (
              <Link href={loginUrl} className="hero-btn landing-cta-btn">
                Inscribirme
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}
