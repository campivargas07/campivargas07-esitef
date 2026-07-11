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
    const data = await readJsonResponse<{ url?: string }>(res);
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
      <div className="esitef-module-shell">
        <div className="esitef-module-card">
          <h2>Inscripción online</h2>
          <p className="presencial-checkout-cta__lead">
            Elige tu plan y completa el pago de forma segura para{" "}
            <strong>{courseTitle}</strong>.
          </p>
          {error && <p className="presencial-checkout-cta__error">{error}</p>}
          <div className="checkout-plans presencial-checkout-cta__plans">
            {Object.entries(config.plans).map(([planKey, plan]) => (
              <button
                key={planKey}
                type="button"
                className={`checkout-plan checkout-plan--link${
                  plan.highlight ? " checkout-plan--highlight" : ""
                }${planKey === config.default_plan ? " checkout-plan--selected" : ""}`}
                onClick={() => checkout(planKey)}
                disabled={loading !== null}
              >
                {plan.highlight && (
                  <span className="checkout-plan__badge">Recomendado</span>
                )}
                <span className="checkout-plan__name">{plan.name}</span>
                <span className="checkout-plan__amount">{plan.amount_display}</span>
                {plan.period && (
                  <span className="checkout-plan__period">{plan.period}</span>
                )}
                {loading === planKey && (
                  <span className="checkout-plan__period">Redirigiendo…</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
