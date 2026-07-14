"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import type { PresencialCheckoutConfig } from "@/lib/presencial-checkout";
import { readJsonResponse } from "@/lib/read-json-response";

type Props = {
  instanceSlug: string;
  courseTitle: string;
  config: PresencialCheckoutConfig;
};

function planCtaLabel(planKey: string): string {
  switch (planKey) {
    case "reserva":
      return "Reservar plaza";
    case "3-cuotas":
      return "Elegir 3 cuotas";
    case "completo":
      return "Pagar completo";
    default:
      return "Continuar";
  }
}

export function PresencialCheckoutPlans({
  instanceSlug,
  courseTitle,
  config,
}: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function checkout(planKey: string) {
    setLoading(planKey);
    setError("");
    const res = await fetch("/api/checkout/presencial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instanceSlug, planKey }),
    });
    const data = await readJsonResponse<{ url?: string; error?: string }>(res);
    setLoading(null);

    if (res.status === 401) {
      await signIn(undefined, {
        callbackUrl: `/${instanceSlug}#inscribirme`,
      });
      return;
    }

    if (!res.ok || !data.url) {
      setError(data.error ?? "No se pudo iniciar el pago.");
      return;
    }

    window.location.href = data.url;
  }

  return (
    <section className="presencial-checkout-cta" id="inscribirme">
      <div className="presencial-checkout-cta__inner">
        <h2 className="presencial-checkout-cta__title">Elige tu forma de pago</h2>
        <p className="presencial-checkout-cta__lead">
          Completa tu inscripción de forma segura para{" "}
          <strong>{courseTitle}</strong>.
        </p>
        {error && <p className="presencial-checkout-cta__error">{error}</p>}
        <div className="presencial-checkout-cta__plans">
          {Object.entries(config.plans).map(([planKey, plan]) => {
            const isHighlight = Boolean(plan.highlight);
            const isDefault = planKey === config.default_plan;
            const isLoading = loading === planKey;

            return (
              <article
                key={planKey}
                className={`checkout-plan${
                  isHighlight ? " checkout-plan--highlight" : ""
                }${isDefault ? " checkout-plan--selected" : ""}`}
              >
                {isHighlight && (
                  <span className="checkout-plan__badge">Recomendado</span>
                )}
                <h3 className="checkout-plan__name">{plan.name}</h3>
                <p className="checkout-plan__amount">{plan.amount_display}</p>
                {plan.period && (
                  <p className="checkout-plan__period">{plan.period}</p>
                )}
                <button
                  type="button"
                  className="checkout-plan__cta"
                  onClick={() => checkout(planKey)}
                  disabled={loading !== null}
                >
                  <span className="checkout-plan__cta-label">
                    {isLoading ? "Redirigiendo…" : planCtaLabel(planKey)}
                  </span>
                  {!isLoading && (
                    <span className="checkout-plan__cta-arrow" aria-hidden="true">
                      →
                    </span>
                  )}
                </button>
              </article>
            );
          })}
        </div>
        <p className="presencial-checkout-cta__note">
          Pago seguro procesado por Stripe. Recibirás confirmación por email.
        </p>
      </div>
    </section>
  );
}
