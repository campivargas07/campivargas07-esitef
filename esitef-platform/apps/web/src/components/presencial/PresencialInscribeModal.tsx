"use client";

import { useState } from "react";
import type { PresencialInscription } from "@/lib/presenciales";

type Props = {
  inscription: PresencialInscription;
  courseLabel: string;
};

export function PresencialInscribeModal({ inscription, courseLabel }: Props) {
  const [open, setOpen] = useState(false);
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
      <button
        type="button"
        className="hero-btn js-presencial-inscribe"
        onClick={() => setOpen(true)}
      >
        Inscribirme ahora
      </button>

      {open && (
        <div className="presencial-inscribe" id="inscribirme" aria-hidden={false}>
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
                <strong>
                  1. Realizar un ingreso / transferencia de {deposit}
                </strong>
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

            <div className="presencial-inscribe__actions">
              {whatsapp_url && (
                <a
                  href={whatsapp_url}
                  className="hero-btn presencial-inscribe__cta"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Enviar comprobante por WhatsApp
                </a>
              )}
              {!whatsapp_url && email_url && (
                <a href={email_url} className="hero-btn presencial-inscribe__cta">
                  Enviar comprobante por email
                </a>
              )}
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
      )}
    </>
  );
}
