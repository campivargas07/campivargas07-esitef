"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  formatOnlineMoney,
  type OnlineCurrency,
} from "@/lib/online-currency";
import { loadPayPalSdkV5 } from "@/lib/load-paypal-sdk";
import {
  paypalLocaleForCurrency,
  paypalBillingAddressForCurrency,
} from "@/lib/paypal-locale";
import type {
  PayPalButtonsInstance,
  PayPalCardFieldsInstance,
} from "@/lib/paypal-sdk-v5";
import { readJsonResponse } from "@/lib/read-json-response";
import { getCheckoutAttribution } from "@/lib/attribution";
import { TrackingEcommerceEvent } from "@/components/tracking/TrackingEvents";
import {
  PaymentCardBrandLogos,
  PayPalBrandLogo,
} from "@/components/checkout/PaymentCardBrandLogos";

import "@/styles/paypal-checkout.css";

const COURSE_THUMB_PLACEHOLDER =
  "/img/esitef-inicio4-escuela-de-fisioterapia.webp";

const CARD_FIELD_HEIGHT_PX = 44;

function isDarkTheme(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.getAttribute("data-theme") === "dark";
}

/** Inner iframe text only — borders/height live on our container (PayPal CardFields guide). */
function cardFieldsInputStyle(): Record<string, Record<string, string>> {
  const dark = isDarkTheme();
  return {
    input: {
      appearance: "none",
      "-webkit-appearance": "none",
      border: "0",
      outline: "none",
      "box-shadow": "none",
      background: "transparent",
      "background-color": "transparent",
      height: `${CARD_FIELD_HEIGHT_PX}px`,
      padding: "0 12px",
      "font-size": "16px",
      "line-height": `${CARD_FIELD_HEIGHT_PX}px`,
      "font-family":
        "'Inter Tight', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      "font-weight": "400",
      color: dark ? "#f3f4f6" : "#1a1d24",
    },
    ":focus": {
      border: "0",
      outline: "none",
      "box-shadow": "none",
      color: dark ? "#ffffff" : "#003087",
    },
    ".invalid": {
      color: dark ? "#fca5a5" : "#b91c1c",
    },
  };
}

function syncCardFieldClasses(
  containerId: string,
  field?: { isValid?: boolean; isEmpty?: boolean; isFocused?: boolean }
) {
  const el = document.getElementById(containerId);
  if (!el || !field) return;
  el.classList.toggle("is-focused", Boolean(field.isFocused));
  el.classList.toggle(
    "is-invalid",
    Boolean(!field.isEmpty && field.isValid === false)
  );
  const wrap = el.closest(".paypal-checkout-page__card-field-wrap");
  if (wrap) {
    wrap.classList.toggle("is-focused", Boolean(field.isFocused));
    wrap.classList.toggle(
      "is-invalid",
      Boolean(!field.isEmpty && field.isValid === false)
    );
  }
}

function formatPayPalClientError(err: unknown): string {
  const raw =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : "";

  // PayPal SDK often wraps JSON in "… returned status 422 … {json}"
  const jsonMatch = raw.match(/\{[\s\S]*"name"\s*:\s*"UNPROCESSABLE_ENTITY"[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]) as {
        details?: Array<{ issue?: string; description?: string }>;
      };
      const issue = parsed.details?.[0]?.issue;
      if (issue === "PAYER_CANNOT_PAY") {
        return "PayPal sandbox rechazó esta tarjeta (PAYER_CANNOT_PAY). Prueba 4111 1111 1111 1111 o el botón amarillo de PayPal. Si sigue fallando, activa Advanced Credit and Debit Card Payments en la app Sandbox.";
      }
      if (issue === "INSTRUMENT_DECLINED") {
        return "La tarjeta fue rechazada. Prueba otra tarjeta de prueba de PayPal.";
      }
      if (issue) {
        const desc = parsed.details?.[0]?.description;
        return desc ? `${issue}: ${desc}` : issue;
      }
    } catch {
      /* fall through */
    }
  }

  if (err instanceof Error && err.message.trim()) {
    // Avoid dumping huge SDK blobs in the UI.
    if (err.message.length > 180) {
      return "No se pudo procesar la tarjeta. Prueba otra tarjeta de sandbox o el botón PayPal.";
    }
    return err.message;
  }
  if (typeof err === "string" && err.trim()) {
    return err.length > 180
      ? "No se pudo procesar la tarjeta. Prueba otra tarjeta de sandbox o el botón PayPal."
      : err;
  }
  if (err && typeof err === "object") {
    const o = err as {
      message?: unknown;
      name?: unknown;
      details?: unknown;
    };
    if (Array.isArray(o.details) && o.details[0]) {
      const d = o.details[0] as {
        issue?: unknown;
        description?: unknown;
      };
      const issue = typeof d.issue === "string" ? d.issue : "";
      if (issue === "PAYER_CANNOT_PAY") {
        return "PayPal sandbox rechazó esta tarjeta (PAYER_CANNOT_PAY). Prueba 4111 1111 1111 1111 o el botón amarillo de PayPal.";
      }
      const desc = typeof d.description === "string" ? d.description : "";
      if (issue || desc) return [issue, desc].filter(Boolean).join(": ");
    }
    const bits = [o.name, o.message].filter(
      (x): x is string => typeof x === "string" && x.trim().length > 0
    );
    if (bits.length) return bits.join(": ");
  }
  return "Error al procesar el pago.";
}

type Props = {
  courseSlug: string;
  courseTitle: string;
  courseThumbnailUrl?: string | null;
  amountMinor: number;
  currency: OnlineCurrency;
  clientId: string;
  /** PayPal identity client token for CardFields (data-client-token). */
  clientToken: string;
  /** When true, SDK uses buyer-country=US for sandbox ACDC test cards. */
  sandbox?: boolean;
  backHref?: string;
  presencial?: { instanceSlug: string; planKey: string };
  /** Guest presencial: no account; needs name + email for confirmation. */
  guestCheckout?: boolean;
  /** Logged-in buyer (session); used as cardholderName and stored in order metadata. */
  buyerName?: string;
  buyerEmail?: string;
};

type PayMethod = "paypal" | "card";
type Status = "loading" | "ready" | "paying" | "error" | "unsupported";

type OrderResponse = {
  orderId: string;
  paypalOrderId: string;
};

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}

export function PayPalCheckoutPanel({
  courseSlug,
  courseTitle,
  courseThumbnailUrl,
  amountMinor,
  currency,
  clientId,
  clientToken,
  sandbox = false,
  backHref,
  presencial,
  guestCheckout = false,
  buyerName,
  buyerEmail,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState("");
  const [method, setMethod] = useState<PayMethod>("card");
  const [paypalEligible, setPaypalEligible] = useState(false);
  const [cardsEligible, setCardsEligible] = useState(false);
  const [guestEmail, setGuestEmail] = useState(buyerEmail ?? "");
  const [cardholderName, setCardholderName] = useState(buyerName ?? "");
  const askGuestIdentity = guestCheckout;

  const cardFieldsRef = useRef<PayPalCardFieldsInstance | null>(null);
  const walletBtnRef = useRef<PayPalButtonsInstance | null>(null);
  const esitefOrderIdRef = useRef<string | null>(null);
  const guestEmailRef = useRef(buyerEmail ?? "");
  const cardholderNameRef = useRef(buyerName ?? "");
  const createPayPalOrderRef = useRef<
    (opts?: { guestEmail?: string; guestName?: string }) => Promise<{ orderId: string }>
  >(async () => {
    throw new Error("PayPal createOrder aún no está listo.");
  });
  const capturePaymentRef = useRef<
    (paypalOrderId: string) => Promise<void>
  >(async () => {
    throw new Error("PayPal capture aún no está listo.");
  });
  const askGuestIdentityRef = useRef(askGuestIdentity);
  const mountedRef = useRef(true);

  const walletRef = useRef<HTMLDivElement>(null);

  // Stable DOM ids for HostedFields selectors (v5 mounts iframes by CSS selector).
  const idPrefix = useId().replace(/[:]/g, "");
  const numberDomId = `${idPrefix}-number`;
  const expiryDomId = `${idPrefix}-expiry`;
  const cvvDomId = `${idPrefix}-cvv`;

  useEffect(() => {
    guestEmailRef.current = guestEmail;
  }, [guestEmail]);

  useEffect(() => {
    cardholderNameRef.current = cardholderName;
  }, [cardholderName]);

  useEffect(() => {
    askGuestIdentityRef.current = askGuestIdentity;
  }, [askGuestIdentity]);

  const capturePayment = useCallback(
    async (paypalOrderId: string) => {
      const orderId = esitefOrderIdRef.current;
      if (!orderId) throw new Error("Orden interna no encontrada.");

      const res = await fetch("/api/checkout/paypal/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paypalOrderId }),
      });
      const data = await readJsonResponse<{ ok?: boolean; error?: string }>(res);
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "No se pudo confirmar el pago.");
      }

      router.push(
        `/gracias?provider=paypal&token=${encodeURIComponent(paypalOrderId)}`
      );
    },
    [router]
  );

  const guestOrderOpts = useCallback(() => {
    if (!askGuestIdentityRef.current) return {};
    const guestEmail = guestEmailRef.current.trim().toLowerCase();
    const guestName = cardholderNameRef.current.trim();
    return {
      ...(guestEmail ? { guestEmail } : {}),
      ...(guestName ? { guestName } : {}),
    };
  }, []);

  const createPayPalOrder = useCallback(
    async (opts?: { guestEmail?: string; guestName?: string }): Promise<{ orderId: string }> => {
      const res = await fetch(
        presencial ? "/api/checkout/presencial/paypal" : "/api/checkout/paypal",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            presencial
              ? {
                  instanceSlug: presencial.instanceSlug,
                  planKey: presencial.planKey,
                  attribution: getCheckoutAttribution(),
                  ...guestOrderOpts(),
                  ...(opts?.guestEmail ? { guestEmail: opts.guestEmail } : {}),
                  ...(opts?.guestName ? { guestName: opts.guestName } : {}),
                }
              : {
                  courseSlug,
                  currency,
                  attribution: getCheckoutAttribution(),
                }
          ),
        }
      );
      const data = await readJsonResponse<OrderResponse & { error?: string }>(
        res
      );
      if (!res.ok || !data.paypalOrderId || !data.orderId) {
        throw new Error(data.error ?? "No se pudo crear la orden.");
      }
      esitefOrderIdRef.current = data.orderId;
      return { orderId: data.paypalOrderId };
    },
    [courseSlug, currency, guestOrderOpts, presencial]
  );

  createPayPalOrderRef.current = createPayPalOrder;
  capturePaymentRef.current = capturePayment;

  // 1) Load SDK v5 + eligibility.
  useEffect(() => {
    mountedRef.current = true;

    async function init() {
      try {
        const locale = paypalLocaleForCurrency(currency);
        await loadPayPalSdkV5({
          clientId,
          clientToken,
          currency,
          locale,
          ...(sandbox ? { buyerCountry: "US" } : {}),
        });
        if (!mountedRef.current) return;
        if (!window.paypal) throw new Error("PayPal SDK no disponible.");

        // CardFields is the current ACDC component (HostedFields is legacy).
        const probe = window.paypal.CardFields?.({
          createOrder: async () => "",
          onApprove: async () => {},
        });
        const canCards = Boolean(probe?.isEligible());
        const canPayPal = true;

        console.info("[paypal-sdk] eligibility", {
          canCards,
          hasCardFields: Boolean(window.paypal.CardFields),
        });

        setPaypalEligible(canPayPal);
        setCardsEligible(canCards);

        if (!canPayPal && !canCards) {
          setStatus("unsupported");
          return;
        }
        setMethod(canCards ? "card" : "paypal");
        setStatus("ready");
      } catch (err) {
        if (!mountedRef.current) return;
        setStatus("error");
        setError(
          err instanceof Error ? err.message : "No se pudo cargar el checkout."
        );
      }
    }

    void init();

    return () => {
      mountedRef.current = false;
      esitefOrderIdRef.current = null;
    };
  }, [clientId, clientToken, currency, sandbox]);

  // 2) Mount PayPal wallet once eligible. Keep mounted during "paying".
  useEffect(() => {
    if (!paypalEligible) return;
    if (!window.paypal || !walletRef.current) return;

    const host = walletRef.current;
    host.replaceChildren();

    const buttons = window.paypal.Buttons({
      style: {
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "paypal",
        height: 50,
        tagline: false,
      },
      createOrder: async () => {
        if (askGuestIdentityRef.current) {
          const err = validateGuestIdentity();
          if (err) throw new Error(err);
        }
        return (await createPayPalOrderRef.current()).orderId;
      },
      onApprove: async (data) => {
        try {
          setMethod("paypal");
          setStatus("paying");
          await capturePayment(data.orderID);
        } catch (err) {
          setStatus("ready");
          setError(
            err instanceof Error ? err.message : "Error al confirmar el pago."
          );
        }
      },
      onCancel: () => {
        setStatus("ready");
      },
      onError: (err) => {
        console.error("[paypal-wallet]", err);
        setStatus("ready");
        setError("El pago con PayPal no se completó.");
      },
    });

    if (!buttons.isEligible()) {
      setPaypalEligible(false);
      return;
    }

    walletBtnRef.current = buttons;
    buttons.render(host).catch((err) => {
      console.error("[paypal-wallet] render", err);
    });

    return () => {
      walletBtnRef.current = null;
      void buttons.close().catch(() => {});
      host.replaceChildren();
    };
  }, [paypalEligible, capturePayment]);

  // 3) Mount CardFields once. Must NOT remount when status → "paying".
  useEffect(() => {
    if (!cardsEligible) return;
    if (!window.paypal?.CardFields) return;

    let cancelled = false;

    const raf = requestAnimationFrame(() => {
      if (cancelled) return;
      if (
        !document.getElementById(numberDomId) ||
        !document.getElementById(expiryDomId) ||
        !document.getElementById(cvvDomId)
      ) {
        return;
      }

      const fieldIds = {
        number: numberDomId,
        expiry: expiryDomId,
        cvv: cvvDomId,
      } as const;

      const inputEventsFor = (containerId: string) => ({
        onFocus: () => {
          document.getElementById(containerId)?.classList.add("is-focused");
          document
            .getElementById(containerId)
            ?.closest(".paypal-checkout-page__card-field-wrap")
            ?.classList.add("is-focused");
        },
        onBlur: (event: {
          fields?: Record<
            string,
            { isValid?: boolean; isEmpty?: boolean; isFocused?: boolean }
          >;
          emittedBy?: string;
        }) => {
          const key = event.emittedBy;
          const field = key ? event.fields?.[key] : undefined;
          syncCardFieldClasses(containerId, {
            ...field,
            isFocused: false,
          });
        },
        onChange: (event: {
          fields?: Record<
            string,
            { isValid?: boolean; isEmpty?: boolean; isFocused?: boolean }
          >;
          emittedBy?: string;
        }) => {
          const key = event.emittedBy;
          if (!key) return;
          const container =
            key === "number" || key === "cardNumber"
              ? fieldIds.number
              : key === "expiry" || key === "expirationDate"
                ? fieldIds.expiry
                : key === "cvv"
                  ? fieldIds.cvv
                  : containerId;
          syncCardFieldClasses(container, event.fields?.[key]);
        },
      });

      const cardFields = window.paypal!.CardFields!({
        style: cardFieldsInputStyle(),
        createOrder: async () => {
          if (askGuestIdentityRef.current) {
            const err = validateGuestIdentity();
            if (err) throw new Error(err);
          }
          const emailOpt =
            guestEmailRef.current.trim()
              ? { guestEmail: guestEmailRef.current.trim().toLowerCase() }
              : undefined;
          const { orderId } = await createPayPalOrderRef.current(emailOpt);
          return orderId;
        },
        onApprove: async (data) => {
          try {
            setStatus("paying");
            await capturePaymentRef.current(data.orderID);
          } catch (err) {
            console.error("[paypal-card] capture", err);
            setStatus("ready");
            setError(formatPayPalClientError(err));
          }
        },
        onCancel: () => {
          setStatus("ready");
        },
        onError: (err) => {
          console.error("[paypal-card] onError", err);
          setStatus("ready");
          setError(formatPayPalClientError(err));
        },
      });

      if (!cardFields.isEligible()) {
        setCardsEligible(false);
        return;
      }

      cardFieldsRef.current = cardFields;
      void Promise.all([
        cardFields
          .NumberField({
            placeholder: "1234 1234 1234 1234",
            inputEvents: inputEventsFor(numberDomId),
          })
          .render(`#${numberDomId}`),
        cardFields
          .ExpiryField({
            placeholder: "MM/AA",
            inputEvents: inputEventsFor(expiryDomId),
          })
          .render(`#${expiryDomId}`),
        cardFields
          .CVVField({
            placeholder: "CVV",
            inputEvents: inputEventsFor(cvvDomId),
          })
          .render(`#${cvvDomId}`),
      ]).catch((err) => {
        console.error("[paypal-card] CardFields.render", err);
        if (!cancelled) {
          setError("No se pudieron cargar los campos de tarjeta.");
        }
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      cardFieldsRef.current = null;
      document.getElementById(numberDomId)?.replaceChildren();
      document.getElementById(expiryDomId)?.replaceChildren();
      document.getElementById(cvvDomId)?.replaceChildren();
    };
  }, [cardsEligible, numberDomId, expiryDomId, cvvDomId]);

  function validateCardForm(): string | null {
    const email = guestEmailRef.current.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Introduce un email válido para enviarte la confirmación.";
    }
    const name = cardholderNameRef.current.trim();
    if (name.length < 2) {
      return "Introduce el nombre del titular de la tarjeta.";
    }
    return null;
  }

  function validateGuestIdentity(): string | null {
    return validateCardForm();
  }

  function cardholderNameForSubmit(): string | undefined {
    const name = cardholderNameRef.current.trim();
    return name.length >= 2 ? name : undefined;
  }

  async function payWithCard() {
    setMethod("card");
    const cardFields = cardFieldsRef.current;
    if (!cardFields) {
      setError(
        "Los campos de tarjeta aún no están listos. Espera un segundo e intenta de nuevo."
      );
      return;
    }

    if (askGuestIdentity) {
      const guestErr = validateGuestIdentity();
      if (guestErr) {
        setError(guestErr);
        return;
      }
    } else {
      const formErr = validateCardForm();
      if (formErr) {
        setError(formErr);
        return;
      }
    }

    const cardholderName = cardholderNameForSubmit();

    setStatus("paying");
    setError("");

    try {
      console.info("[paypal-card] submit start");
      await withTimeout(
        cardFields.submit({
          // Sandbox ACDC merchants are usually US — keep billing aligned.
          billingAddress: paypalBillingAddressForCurrency(
            sandbox ? "USD" : currency
          ),
          ...(cardholderName ? { cardholderName } : {}),
        }),
        45_000,
        "PayPal no respondió al enviar la tarjeta. Prueba con el botón amarillo de PayPal."
      );
      console.info("[paypal-card] submit ok (onApprove captura)");
    } catch (err) {
      console.error("[paypal-card] submit error", err);
      setStatus("ready");
      setError(formatPayPalClientError(err));
    }
  }

  const showUi = status !== "unsupported";
  const thumbSrc = courseThumbnailUrl || COURSE_THUMB_PLACEHOLDER;
  const [isHttps, setIsHttps] = useState(true);

  useEffect(() => {
    setIsHttps(window.location.protocol === "https:");
  }, []);

  return (
    <div className="paypal-checkout-page">
      <TrackingEcommerceEvent
        event="begin_checkout"
        currency={currency}
        value={amountMinor / 100}
        items={[
          {
            item_id: presencial
              ? `${presencial.instanceSlug}:${presencial.planKey}`
              : courseSlug,
            item_name: courseTitle,
            price: amountMinor / 100,
            quantity: 1,
          },
        ]}
      />
      <header className="paypal-checkout-page__header">
        <Link
          className="paypal-checkout-page__back"
          href={backHref ?? `/cursos/${courseSlug}`}
          aria-label={presencial ? "Volver a la inscripción" : "Volver al curso"}
        >
          <span aria-hidden="true">←</span>
        </Link>
        <h1 className="paypal-checkout-page__title">Resumen del pedido</h1>
        <svg
          className="paypal-checkout-page__lock"
          viewBox="0 0 24 24"
          aria-label="Pago seguro"
          role="img"
        >
          <path d="M7 10V8a5 5 0 0 1 10 0v2m-11 0h12v10H6V10Zm6 4v2" />
        </svg>
      </header>

      <div className="paypal-checkout-page__layout">
        <section className="paypal-checkout-page__payment" aria-label="Forma de pago">
          <h2 className="paypal-checkout-page__heading">Pago con tarjeta</h2>
          <p className="paypal-checkout-page__payment-intro">Ingresa los datos</p>

          {status === "loading" && (
            <p className="paypal-checkout-page__status">Cargando métodos de pago…</p>
          )}

          {status === "unsupported" && (
            <p className="paypal-checkout-page__error" role="alert">
              PayPal no ofrece métodos de pago para esta moneda en tu región.
            </p>
          )}

          {error && (
            <p className="paypal-checkout-page__error" role="alert" aria-live="polite">
              {error}
            </p>
          )}

          {!isHttps && method === "card" && (
            <p className="paypal-checkout-page__status" role="status">
              En HTTP la tarjeta puede fallar. Usa la URL de ngrok (https://…).
            </p>
          )}

          {status === "paying" && method === "card" && (
            <p className="paypal-checkout-page__status" role="status">
              Si aparece verificación bancaria, complétala en la ventana emergente.
            </p>
          )}

          {showUi && status !== "loading" && (
            <div className="paypal-checkout-page__options">
              {cardsEligible && (
                <div className="paypal-checkout-page__card-form">
                  <label className="paypal-checkout-page__field-label">
                    <span>Email para la confirmación</span>
                    <input
                      type="email"
                      name="guestEmail"
                      autoComplete="email"
                      inputMode="email"
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="paypal-checkout-page__email-input"
                      placeholder="tu@email.com"
                      disabled={status === "paying"}
                    />
                  </label>
                  <div className="paypal-checkout-page__field-label">
                    <span>Número de tarjeta</span>
                    <div className="paypal-checkout-page__card-field-wrap">
                      <div
                        className="paypal-checkout-page__card-field paypal-checkout-page__card-field--number"
                        id={numberDomId}
                      />
                      <PaymentCardBrandLogos
                        className="paypal-checkout-page__card-brands-infield"
                        compact
                      />
                    </div>
                  </div>
                  <div className="paypal-checkout-page__card-row">
                    <div className="paypal-checkout-page__field-label">
                      <span>Expiración</span>
                      <div
                        className="paypal-checkout-page__card-field"
                        id={expiryDomId}
                      />
                    </div>
                    <div className="paypal-checkout-page__field-label">
                      <span className="paypal-checkout-page__cvv-label">
                        CVV
                        <span
                          className="paypal-checkout-page__help"
                          title="Los 3 o 4 dígitos de seguridad de tu tarjeta"
                          aria-label="Los 3 o 4 dígitos de seguridad de tu tarjeta"
                          tabIndex={0}
                        >
                          ?
                        </span>
                      </span>
                      <div
                        className="paypal-checkout-page__card-field"
                        id={cvvDomId}
                      />
                    </div>
                  </div>
                  <label className="paypal-checkout-page__field-label">
                    <span>Nombre del titular de la tarjeta</span>
                    <input
                      type="text"
                      name="cardholderName"
                      autoComplete="cc-name"
                      required
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      className="paypal-checkout-page__email-input"
                      placeholder="Como aparece en la tarjeta"
                      disabled={status === "paying"}
                    />
                  </label>
                  <button
                    type="button"
                    className="paypal-checkout-page__submit"
                    onClick={() => void payWithCard()}
                    disabled={status === "paying"}
                  >
                    {status === "paying" && method === "card"
                      ? "Procesando…"
                      : "Pagar ahora"}
                  </button>
                </div>
              )}

              {paypalEligible && cardsEligible && (
                <div className="paypal-checkout-page__separator">
                  <span>or</span>
                </div>
              )}

              {paypalEligible && (
                <div className="paypal-checkout-page__wallet">
                  <div className="paypal-checkout-page__wallet-fallback" aria-hidden="true">
                    <PayPalBrandLogo />
                  </div>
                  <div
                    className="paypal-checkout-page__wallet-host"
                    ref={walletRef}
                  />
                </div>
              )}
            </div>
          )}

          <p className="paypal-checkout-page__secure">
            <span aria-hidden="true">🔒</span> Pago seguro procesado por PayPal
          </p>
        </section>

        <aside className="paypal-checkout-page__summary" aria-label="Resumen del pedido">
          <div className="paypal-checkout-page__summary-head">
            <h2 className="paypal-checkout-page__summary-title">Tu pedido</h2>
            <span className="paypal-checkout-page__summary-count">1 artículo</span>
          </div>

          <div className="paypal-checkout-page__line-item">
            <div className="paypal-checkout-page__thumb">
              <Image
                src={thumbSrc}
                alt=""
                width={144}
                height={144}
                unoptimized
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <p className="paypal-checkout-page__line-title">{courseTitle}</p>
            <p className="paypal-checkout-page__line-price">
              {formatOnlineMoney(amountMinor, currency)}
            </p>
          </div>

          <dl className="paypal-checkout-page__totals">
            <div className="paypal-checkout-page__totals-row paypal-checkout-page__totals-row--total">
              <dt>Total</dt>
              <dd>{formatOnlineMoney(amountMinor, currency)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
