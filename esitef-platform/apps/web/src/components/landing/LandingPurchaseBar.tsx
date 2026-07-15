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
};

export function LandingPurchaseBar({
  courseSlug,
  priceCents,
  currency,
  enrolled,
  isLoggedIn,
}: Props) {
  const [loading, setLoading] = useState(false);
  const loginUrl = `/ingresar?callbackUrl=${encodeURIComponent(`/cursos/${courseSlug}`)}`;

  async function checkout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug, currency }),
      });
      const data = await readJsonResponse<{ url?: string }>(res);
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

  return (
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
                onClick={checkout}
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
  );
}
