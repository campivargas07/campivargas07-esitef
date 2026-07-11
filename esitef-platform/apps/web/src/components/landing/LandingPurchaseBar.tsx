"use client";

import Link from "next/link";
import { useState } from "react";
import { readJsonResponse } from "@/lib/read-json-response";

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

type Props = {
  courseSlug: string;
  priceCents: number;
  currency: string;
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
        body: JSON.stringify({ courseSlug }),
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
                {formatPrice(priceCents, currency)}
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
