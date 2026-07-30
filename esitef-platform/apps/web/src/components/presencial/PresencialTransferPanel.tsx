"use client";

import Link from "next/link";
import { useState } from "react";
import type { PresencialInscription } from "@/lib/presenciales";
import type { PresencialPlan } from "@/lib/presencial-checkout";
import { getCheckoutAttribution } from "@/lib/attribution";
import { readJsonResponse } from "@/lib/read-json-response";
import "@/styles/paypal-checkout.css";

type Props = {
  instanceSlug: string;
  planKey: string;
  plan: PresencialPlan;
  courseTitle: string;
  inscription: PresencialInscription;
  guestCheckout: boolean;
  buyerName?: string;
  buyerEmail?: string;
  backHref: string;
};

function buildProofMailto(inscription: PresencialInscription, courseTitle: string) {
  const email = inscription.contact_email ?? "info@esitef.com";
  const subject =
    inscription.concept?.trim() ||
    inscription.email_subject?.trim() ||
    `Inscripción — ${courseTitle}`;
  const body =
    inscription.email_body?.trim() ||
    `Asunto: ${subject}\nNombre del participante\nTeléfono + e-mail\nUniversidad donde se graduó o estudia`;
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function PresencialTransferPanel({
  instanceSlug,
  planKey,
  plan,
  courseTitle,
  inscription,
  guestCheckout,
  buyerName,
  buyerEmail,
  backHref,
}: Props) {
  const [guestName, setGuestName] = useState(buyerName ?? "");
  const [guestEmail, setGuestEmail] = useState(buyerEmail ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const accounts = inscription.accounts ?? [];
  const proofMailto = buildProofMailto(inscription, courseTitle);
  const contactEmail = inscription.contact_email ?? "info@esitef.com";

  async function registerTransfer() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/checkout/presencial/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instanceSlug,
        planKey,
        ...(guestCheckout
          ? { guestName: guestName.trim(), guestEmail: guestEmail.trim() }
          : {}),
        attribution: getCheckoutAttribution(),
      }),
    });

    const data = await readJsonResponse<{ orderId?: string; error?: string }>(res);
    setLoading(false);

    if (!res.ok || !data.orderId) {
      setError(data.error ?? "No se pudo registrar la inscripción.");
      return;
    }

    window.location.href = `/gracias?provider=transfer&order=${encodeURIComponent(data.orderId)}&pending=1&instance=${encodeURIComponent(instanceSlug)}`;
  }

  return (
    <div className="paypal-checkout-page">
      <header className="paypal-checkout-page__header">
        <Link href={backHref} className="paypal-checkout-page__back" aria-label="Volver">
          ←
        </Link>
        <h1 className="paypal-checkout-page__title">Transferencia bancaria</h1>
        <span aria-hidden="true" />
      </header>

      <div className="paypal-checkout-page__body">
        <p className="paypal-checkout-page__course">{courseTitle}</p>
        <p className="paypal-checkout-page__plan">{plan.name}</p>
        <p className="paypal-checkout-page__amount">{plan.amount_display}</p>

        {guestCheckout ? (
          <div className="paypal-checkout-page__fields">
            <label className="paypal-checkout-page__field">
              <span>Nombre completo</span>
              <input
                type="text"
                autoComplete="name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
              />
            </label>
            <label className="paypal-checkout-page__field">
              <span>Email</span>
              <input
                type="email"
                autoComplete="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
              />
            </label>
          </div>
        ) : null}

        <section className="paypal-checkout-page__summary" aria-labelledby="transfer-bank-title">
          <h2 id="transfer-bank-title">Datos para transferir</h2>
          {inscription.holder ? (
            <p>
              <strong>Titular:</strong> {inscription.holder}
            </p>
          ) : null}
          {accounts.length > 0 ? (
            <ul className="paypal-checkout-page__summary-list">
              {accounts.map((row) => (
                <li key={row.label}>
                  <span>{row.label}</span>
                  <strong>{row.number}</strong>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <ol className="paypal-checkout-page__steps">
          <li>Realiza la transferencia por el importe indicado.</li>
          <li>
            Envía el comprobante a{" "}
            <a href={proofMailto}>{contactEmail}</a>.
          </li>
          <li>Confirma abajo que ya transferiste para registrar tu inscripción.</li>
        </ol>

        {error ? <p className="paypal-checkout-page__error">{error}</p> : null}

        <button
          type="button"
          className="paypal-checkout-page__submit"
          disabled={loading}
          onClick={() => void registerTransfer()}
        >
          {loading ? "Registrando…" : "Ya transferí / Registrar mi inscripción"}
        </button>
      </div>
    </div>
  );
}
