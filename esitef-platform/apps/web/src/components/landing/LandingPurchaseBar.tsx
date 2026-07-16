"use client";

import Link from "next/link";
import { useState } from "react";
import { readJsonResponse } from "@/lib/read-json-response";
import {
  formatOnlineMoney,
  type OnlineCurrency,
} from "@/lib/online-currency";
import type { PayPalSdkMode } from "@/lib/paypal-sdk-v6";
import { PayPalCheckoutModal } from "@/components/checkout/PayPalCheckoutModal";

type Props = {
  courseSlug: string;
  courseTitle: string;
  priceCents: number;
  currency: OnlineCurrency;
  enrolled: boolean;
  isLoggedIn: boolean;
  showPayPalEmbedded: boolean;
  paypalClientId: string;
  paypalSdkMode: PayPalSdkMode;
};

export function LandingPurchaseBar({
  courseSlug,
  courseTitle,
  priceCents,
  currency,
  enrolled,
  isLoggedIn,
  showPayPalEmbedded,
  paypalClientId,
  paypalSdkMode,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [paypalOpen, setPaypalOpen] = useState(false);
  const loginUrl = `/ingresar?callbackUrl=${encodeURIComponent(`/cursos/${courseSlug}`)}`;

  async function checkoutStripe() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/stripe", {
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
      setLoading(false);
    }
  }

  function startCheckout() {
    if (showPayPalEmbedded) {
      setPaypalOpen(true);
      return;
    }
    void checkoutStripe();
  }

  return (
    <>
      <div className="landing-purchase-bar">
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
                <button
                  type="button"
                  className="hero-btn landing-cta-btn tutor-btn-primary"
                  onClick={startCheckout}
                  disabled={loading}
                >
                  {loading ? "Redirigiendo…" : "Inscribirme"}
                </button>
              ) : (
                <Link href={loginUrl} className="hero-btn landing-cta-btn">
                  Inscribirme
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {showPayPalEmbedded && (
        <PayPalCheckoutModal
          open={paypalOpen}
          onClose={() => setPaypalOpen(false)}
          courseSlug={courseSlug}
          courseTitle={courseTitle}
          amountMinor={priceCents}
          currency={currency}
          clientId={paypalClientId}
          sdkMode={paypalSdkMode}
        />
      )}
    </>
  );
}
