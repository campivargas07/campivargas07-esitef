"use client";

import Link from "next/link";
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
  const checkoutUrl = `/cursos/${courseSlug}/pagar`;
  const loginUrl = `/ingresar?callbackUrl=${encodeURIComponent(checkoutUrl)}`;

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
              <Link
                href={checkoutUrl}
                className="hero-btn landing-cta-btn tutor-btn-primary"
              >
                Inscribirme
              </Link>
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
