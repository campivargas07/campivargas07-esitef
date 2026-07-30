"use client";

import { useEffect, useState } from "react";
import type { PresencialInscription } from "@/lib/presenciales";
import {
  getPresencialCheckoutConfig,
  presencialUsesSimpleInscribeModal,
} from "@/lib/presencial-checkout";
import {
  trackTransferenciaIntent,
  trackWhatsAppClick,
} from "@/components/tracking/TrackingEvents";

type Props = {
  inscription: PresencialInscription;
  courseLabel: string;
  instanceSlug?: string;
  planKey?: string;
  /** Solo el diálogo (desde cards de checkout). */
  embedded?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type InscribeTone = "tu" | "vos";

function inscribeTone(instanceSlug?: string): InscribeTone {
  return instanceSlug === "gestion-funcional-fuerzas-medellin" ? "tu" : "vos";
}

function transferStepLabel(
  planKey: string | undefined,
  deposit: string | undefined,
  tone: InscribeTone,
  instanceSlug?: string
) {
  const verb = tone === "tu" ? "Transfiere" : "Transferí";
  if (instanceSlug && planKey) {
    const plan = getPresencialCheckoutConfig(instanceSlug)?.plans[planKey];
    if (plan?.amount_display) {
      const what =
        planKey === "completo"
          ? "el pago completo"
          : planKey === "reserva"
            ? "la reserva"
            : "el importe";
      return `${verb} ${what} (${plan.amount_display})`;
    }
  }
  if (deposit) {
    return `${verb} la reserva (${deposit})`;
  }
  return tone === "tu" ? "Realiza la transferencia" : "Realizá la transferencia";
}

function SimpleInscribeBody({
  inscription,
  instanceSlug,
  planKey,
  onWhatsAppClick,
}: {
  inscription: PresencialInscription;
  instanceSlug?: string;
  planKey?: string;
  onWhatsAppClick: () => void;
}) {
  const tone = inscribeTone(instanceSlug);
  const sendProof =
    tone === "tu"
      ? "Envía tu comprobante por"
      : "Enviá tu comprobante por";
  const confirmation =
    tone === "tu"
      ? "Recibe tu confirmación por mail cuando validemos tu pago."
      : "Recibí tu confirmación por mail cuando validemos tu pago.";
  const {
    concept,
    accounts = [],
    holder,
    investment,
    discounts = [],
    deposit,
    whatsapp_url,
  } = inscription;

  return (
    <>
      <h2 id="presencial-inscribe-title">Para formalizar tu inscripción (3 pasos)</h2>

      {investment ? (
        <div className="presencial-inscribe__investment">
          <strong>Inversión</strong>
          <p className="presencial-inscribe__investment-lines">
            {investment.split("\n").map((line, index, lines) => (
              <span key={line}>
                {line}
                {index < lines.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
          {discounts.length > 0 ? (
            <ul className="presencial-inscribe__discount-lines">
              {discounts.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          ) : null}
          {discounts.length > 0 ? (
            <p className="presencial-inscribe__note">
              Las promociones no son acumulables.
            </p>
          ) : null}
        </div>
      ) : null}

      <ol className="presencial-inscribe__steps presencial-inscribe__steps--simple">
        <li>
          {transferStepLabel(planKey, deposit, tone, instanceSlug)}
          {accounts.length > 0 || holder ? (
            <ul className="presencial-inscribe__bank-lines">
              {accounts.map((row) => (
                <li key={`${row.label}-${row.number}`}>
                  {row.label}: {row.number}
                </li>
              ))}
              {holder ? <li>Titular: {holder}</li> : null}
            </ul>
          ) : null}
          {concept ? (
            <p className="presencial-inscribe__concept-note">
              En el concepto/motivo: {concept} + tu nombre completo
            </p>
          ) : null}
        </li>
        <li className="presencial-inscribe__step-with-wa">
          <span>{sendProof}</span>
          {whatsapp_url ? (
            <a
              href={whatsapp_url}
              className="presencial-inscribe__wa-btn"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onWhatsAppClick}
            >
              WhatsApp
            </a>
          ) : null}
        </li>
        <li>{confirmation}</li>
      </ol>
    </>
  );
}

function DefaultInscribeBody({
  inscription,
  courseLabel,
  onWhatsAppClick,
}: {
  inscription: PresencialInscription;
  courseLabel: string;
  onWhatsAppClick: () => void;
}) {
  const {
    investment,
    deposit,
    concept,
    holder,
    accounts = [],
    discounts = [],
    whatsapp_url,
    email_url,
    whatsapp_text,
    email_body,
  } = inscription;

  const contactLines = (whatsapp_text || email_body || "")
    .split(/\r\n|\r|\n/)
    .filter((l) => l.trim());

  return (
    <>
      <h2 id="presencial-inscribe-title">
        Para formalizar la inscripción (3 pasos)
      </h2>
      <p className="presencial-inscribe__course">{courseLabel}</p>

      {investment && (
        <div className="presencial-inscribe__investment">
          <strong>Inversión:</strong>
          <span>{investment}</span>
          {discounts.length > 0 && (
            <ul>
              {discounts.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          )}
          {discounts.length > 0 && (
            <p className="presencial-inscribe__note">
              Las promociones no son acumulables.
            </p>
          )}
        </div>
      )}

      <ol className="presencial-inscribe__steps">
        <li>
          <strong>1. Realizar un ingreso / transferencia de {deposit}</strong>
          <ul>
            <li>Nombre del participante.</li>
            {concept && <li>Concepto: «{concept}»</li>}
          </ul>
          {(accounts.length > 0 || holder) && (
            <div className="presencial-inscribe__accounts">
              <strong>Cuenta para inscripción:</strong>
              {accounts.map((acc) => (
                <p key={acc.number}>
                  {acc.label}: {acc.number}
                </p>
              ))}
              {holder && <p>Nombre: {holder}</p>}
            </div>
          )}
        </li>
        <li>
          <strong>2. Enviar el comprobante de ingreso</strong>
          {whatsapp_url && (
            <p>
              <a
                href={whatsapp_url}
                className="presencial-inscribe__whatsapp"
                target="_blank"
                rel="noopener noreferrer"
                onClick={onWhatsAppClick}
              >
                Enviar por WhatsApp
              </a>
            </p>
          )}
          {!whatsapp_url && email_url && (
            <p>
              <a href={email_url} className="presencial-inscribe__whatsapp">
                Enviar a info@esitef.com
              </a>
            </p>
          )}
          {contactLines.length > 0 && (
            <ul>
              {contactLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
        </li>
        <li>
          <strong>3. Recibirá un mail de confirmación</strong>
          <p>Con más detalles sobre el inicio de la certificación.</p>
        </li>
      </ol>
    </>
  );
}

export function PresencialInscribeModal({
  inscription,
  courseLabel,
  instanceSlug,
  planKey,
  embedded = false,
  open: openProp,
  onOpenChange,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const simpleLayout = presencialUsesSimpleInscribeModal(instanceSlug);
  const { whatsapp_url, email_url } = inscription;

  useEffect(() => {
    document.body.classList.toggle("presencial-inscribe-open", open);
    return () => document.body.classList.remove("presencial-inscribe-open");
  }, [open]);

  function onWhatsAppClick() {
    trackWhatsAppClick("presencial_inscripcion", courseLabel);
  }

  return (
    <>
      {!embedded ? (
        <button
          type="button"
          className="hero-btn js-presencial-inscribe"
          onClick={() => {
            trackTransferenciaIntent(courseLabel);
            setOpen(true);
          }}
        >
          Inscribirme ahora
        </button>
      ) : null}

      {open ? (
        <div
          className={`presencial-inscribe${simpleLayout ? " presencial-inscribe--simple" : ""}`}
          id={embedded ? undefined : "inscribirme"}
          aria-hidden={false}
        >
          <div
            className="presencial-inscribe__overlay"
            onClick={() => setOpen(false)}
          />
          <div
            className="presencial-inscribe__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="presencial-inscribe-title"
          >
            <button
              type="button"
              className="presencial-inscribe__close"
              aria-label="Cerrar"
              onClick={() => setOpen(false)}
            >
              &times;
            </button>

            {simpleLayout ? (
              <SimpleInscribeBody
                inscription={inscription}
                instanceSlug={instanceSlug}
                planKey={planKey}
                onWhatsAppClick={onWhatsAppClick}
              />
            ) : (
              <DefaultInscribeBody
                inscription={inscription}
                courseLabel={courseLabel}
                onWhatsAppClick={onWhatsAppClick}
              />
            )}

            <div className="presencial-inscribe__actions">
              {!simpleLayout && whatsapp_url ? (
                <a
                  href={whatsapp_url}
                  className="hero-btn presencial-inscribe__cta"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onWhatsAppClick}
                >
                  Enviar comprobante por WhatsApp
                </a>
              ) : null}
              {!simpleLayout && !whatsapp_url && email_url ? (
                <a href={email_url} className="hero-btn presencial-inscribe__cta">
                  Enviar comprobante por email
                </a>
              ) : null}
              <button
                type="button"
                className="presencial-inscribe__cancel"
                onClick={() => setOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
