"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import type {
  PresencialCheckoutConfig,
  PresencialPlan,
  PresencialPlanBreakdownRow,
} from "@/lib/presencial-checkout";
import { filterPresencialPlansForPais } from "@/lib/presencial-checkout";
import { readJsonResponse } from "@/lib/read-json-response";

type Props = {
  instanceSlug: string;
  config: PresencialCheckoutConfig;
  /** ISO-ish country slug from formacion.pais (e.g. "argentina"). */
  pais?: string | null;
};

async function startPresencialCheckout(
  instanceSlug: string,
  planKey: string
): Promise<{ ok: true; url: string } | { ok: false; status: number; error: string }> {
  const res = await fetch("/api/checkout/presencial", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ instanceSlug, planKey }),
  });
  const data = await readJsonResponse<{ url?: string; error?: string }>(res);
  if (res.status === 401) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }
  if (!res.ok || !data.url) {
    return {
      ok: false,
      status: res.status,
      error: data.error ?? "No se pudo iniciar el pago.",
    };
  }
  return { ok: true, url: data.url };
}

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

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="checkout-lock-icon">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 11V8a5 5 0 0 1 10 0v3M6.5 11h11A1.5 1.5 0 0 1 19 12.5v7A1.5 1.5 0 0 1 17.5 21h-11A1.5 1.5 0 0 1 5 19.5v-7A1.5 1.5 0 0 1 6.5 11Z"
      />
    </svg>
  );
}

function BreakdownIcon({ icon }: { icon: PresencialPlanBreakdownRow["icon"] }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (icon) {
    case "building":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            {...common}
            d="M4 21h16M6 21V7l6-3 6 3v14M10 10h.01M14 10h.01M10 14h.01M14 14h.01M10 18h.01M14 18h.01"
          />
        </svg>
      );
    case "calendar":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            {...common}
            d="M8 3v3M16 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
          />
        </svg>
      );
    case "user":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            {...common}
            d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 20a8 8 0 0 1 16 0"
          />
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M20 7 9.5 17.5 4 12" />
        </svg>
      );
    case "plus":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M12 5v14M5 12h14" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            {...common}
            d="M3 9h18M5 7h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm0 6h3"
          />
        </svg>
      );
  }
}

function PaymentBrandLogos({ showStripe }: { showStripe: boolean }) {
  return (
    <div className="presencial-checkout-cta__brands" aria-label="Métodos de pago">
      {showStripe ? (
        <svg viewBox="0 0 56 16" role="img" aria-label="Stripe">
          <title>Stripe</title>
          <text
            x="0"
            y="13"
            fill="currentColor"
            fontFamily="Inter Tight, sans-serif"
            fontWeight="600"
            fontSize="13"
          >
            stripe
          </text>
        </svg>
      ) : null}
      <svg viewBox="0 0 48 16" role="img" aria-label="Visa">
        <title>Visa</title>
        <text
          x="0"
          y="13"
          fill="currentColor"
          fontFamily="Inter Tight, sans-serif"
          fontWeight="700"
          fontSize="14"
          letterSpacing="0.5"
        >
          VISA
        </text>
      </svg>
      <svg viewBox="0 0 36 22" role="img" aria-label="Mastercard">
        <title>Mastercard</title>
        <circle cx="13" cy="11" r="8" fill="#a8a8a8" opacity="0.85" />
        <circle cx="23" cy="11" r="8" fill="#c8c8c8" opacity="0.85" />
      </svg>
      <svg viewBox="0 0 56 16" role="img" aria-label="PayPal">
        <title>PayPal</title>
        <text
          x="0"
          y="13"
          fill="currentColor"
          fontFamily="Inter Tight, sans-serif"
          fontWeight="700"
          fontSize="12"
          letterSpacing="-0.3"
        >
          PayPal
        </text>
      </svg>
    </div>
  );
}

function ReservePlanCard({
  plan,
  planKey,
  loading,
  disabled,
  onCheckout,
}: {
  plan: PresencialPlan;
  planKey: string;
  loading: boolean;
  disabled: boolean;
  onCheckout: (planKey: string) => void;
}) {
  return (
    <article className="checkout-reserve">
      <h3 className="checkout-reserve__name">{plan.name}</h3>
      <p className="checkout-reserve__amount">{plan.amount_display}</p>

      {plan.breakdown && plan.breakdown.length > 0 ? (
        <ul className="checkout-reserve__breakdown">
          {plan.breakdown.map((row) => (
            <li key={row.label} className="checkout-reserve__row">
              <span className="checkout-reserve__row-icon">
                <BreakdownIcon icon={row.icon} />
              </span>
              <span className="checkout-reserve__row-label">{row.label}</span>
              {row.value ? (
                <span
                  className={`checkout-reserve__row-value${
                    row.tone ? ` checkout-reserve__row-value--${row.tone}` : ""
                  }`}
                >
                  {row.value}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      <button
        type="button"
        className="checkout-reserve__cta"
        onClick={() => onCheckout(planKey)}
        disabled={disabled}
      >
        <span>{loading ? "Redirigiendo…" : "Inscribirme ahora"}</span>
        {!loading && (
          <span className="checkout-reserve__cta-arrow" aria-hidden="true">
            →
          </span>
        )}
      </button>
    </article>
  );
}

function MultiPlanCard({
  plan,
  planKey,
  loading,
  disabled,
  onCheckout,
}: {
  plan: PresencialPlan;
  planKey: string;
  loading: boolean;
  disabled: boolean;
  onCheckout: (planKey: string) => void;
}) {
  const emphasized = Boolean(plan.cta_emphasized);
  const hasBreakdown = Boolean(plan.breakdown?.length);

  return (
    <article className="checkout-plan">
      <h3 className="checkout-plan__name">{plan.name}</h3>
      <p className="checkout-plan__amount">{plan.amount_display}</p>

      {hasBreakdown ? (
        <ul className="checkout-plan__breakdown">
          {plan.breakdown!.map((row) => (
            <li key={row.label} className="checkout-plan__feature">
              <span className="checkout-plan__feature-icon">
                <BreakdownIcon icon={row.icon} />
              </span>
              <span className="checkout-plan__feature-text">
                <span className="checkout-plan__feature-label">{row.label}</span>
                {row.detail ? (
                  <span className="checkout-plan__feature-detail">{row.detail}</span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <>
          {plan.period ? <p className="checkout-plan__period">{plan.period}</p> : null}
          {plan.features && plan.features.length > 0 ? (
            <ul className="checkout-plan__breakdown">
              {plan.features.map((feature) => (
                <li key={feature} className="checkout-plan__feature">
                  <span className="checkout-plan__feature-icon">
                    <BreakdownIcon icon="check" />
                  </span>
                  <span className="checkout-plan__feature-text">
                    <span className="checkout-plan__feature-label">{feature}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}

      <button
        type="button"
        className={`checkout-plan__cta${
          emphasized ? " checkout-plan__cta--emphasized" : ""
        }`}
        onClick={() => onCheckout(planKey)}
        disabled={disabled}
      >
        <span className="checkout-plan__cta-main">
          <span className="checkout-plan__cta-label">
            {loading ? "Redirigiendo…" : planCtaLabel(planKey)}
          </span>
          {!loading && (
            <span className="checkout-plan__cta-arrow" aria-hidden="true">
              →
            </span>
          )}
        </span>
        {!loading && plan.cta_note ? (
          <span className="checkout-plan__cta-note">{plan.cta_note}</span>
        ) : null}
      </button>

      {plan.footer_note ? (
        <p className="checkout-plan__footer">{plan.footer_note}</p>
      ) : null}
    </article>
  );
}

export function PresencialCheckoutPlans({
  instanceSlug,
  config,
  pais,
}: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const filteredPlans = filterPresencialPlansForPais(config.plans, pais);
  const planEntries = Object.entries(filteredPlans);
  const singlePlan = planEntries.length === 1;
  const singleEntry = singlePlan ? planEntries[0] : null;
  const useReserveLayout = Boolean(
    singleEntry && singleEntry[1].breakdown?.length
  );
  const hasCuotas = planEntries.some(
    ([key, plan]) => key === "3-cuotas" || plan.subscription
  );
  const noteText = hasCuotas
    ? "Reserva y pago completo con PayPal. Plan de 3 pagos con tarjeta (Stripe). Recibirás confirmación por email."
    : "Pago seguro con PayPal. Recibirás confirmación por email.";

  async function checkout(planKey: string) {
    setLoading(planKey);
    setError("");
    const result = await startPresencialCheckout(instanceSlug, planKey);
    setLoading(null);

    if (!result.ok) {
      if (result.status === 401) {
        await signIn(undefined, {
          callbackUrl: `/${instanceSlug}#inscribirme`,
        });
        return;
      }
      setError(result.error);
      return;
    }

    window.location.href = result.url;
  }

  if (planEntries.length === 0) {
    return null;
  }

  return (
    <section
      className={`presencial-checkout-cta${
        useReserveLayout ? " presencial-checkout-cta--reserve" : ""
      }`}
      id="inscribirme"
    >
      <div className="presencial-checkout-cta__inner">
        <h2 className="presencial-checkout-cta__title">
          {singlePlan ? "Reserva tu plaza" : "Elige cómo prefieres pagar"}
        </h2>
        <p className="presencial-checkout-cta__lead">
          <LockIcon />
          Completa tu inscripción de forma segura.
        </p>
        {error && <p className="presencial-checkout-cta__error">{error}</p>}

        {useReserveLayout && singleEntry ? (
          <div className="presencial-checkout-cta__plans presencial-checkout-cta__plans--single">
            <ReservePlanCard
              planKey={singleEntry[0]}
              plan={singleEntry[1]}
              loading={loading === singleEntry[0]}
              disabled={loading !== null}
              onCheckout={checkout}
            />
          </div>
        ) : (
          <div className="presencial-checkout-cta__plans">
            {planEntries.map(([planKey, plan]) => (
              <MultiPlanCard
                key={planKey}
                planKey={planKey}
                plan={plan}
                loading={loading === planKey}
                disabled={loading !== null}
                onCheckout={checkout}
              />
            ))}
          </div>
        )}

        <p className="presencial-checkout-cta__note">
          <LockIcon />
          {noteText}
        </p>
        <PaymentBrandLogos showStripe={hasCuotas} />
      </div>
    </section>
  );
}
