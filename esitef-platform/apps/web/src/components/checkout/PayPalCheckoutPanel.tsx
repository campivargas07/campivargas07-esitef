"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  formatOnlineMoney,
  type OnlineCurrency,
} from "@/lib/online-currency";
import { loadPayPalSdkV6 } from "@/lib/load-paypal-sdk";
import { paypalLocaleForCurrency, paypalBillingCountryForCurrency } from "@/lib/paypal-locale";
import type {
  PayPalCardFieldsSession,
  PayPalSdkInstance,
  PayPalSdkMode,
} from "@/lib/paypal-sdk-v6";
import { readJsonResponse } from "@/lib/read-json-response";
import {
  PaymentCardBrandLogos,
  PayPalBrandLogo,
} from "@/components/checkout/PaymentCardBrandLogos";

import "@/styles/paypal-checkout.css";

const COURSE_THUMB_PLACEHOLDER =
  "https://esitef.com/online/wp-content/uploads/2022/12/esitef-inicio4-escuela-de-fisioterapia.webp";

type Props = {
  courseSlug: string;
  courseTitle: string;
  courseThumbnailUrl?: string | null;
  amountMinor: number;
  currency: OnlineCurrency;
  clientId: string;
  sdkMode: PayPalSdkMode;
  backHref?: string;
  presencial?: { instanceSlug: string; planKey: string };
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
  sdkMode,
  backHref,
  presencial,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState("");
  const [method, setMethod] = useState<PayMethod>("card");
  const [paypalEligible, setPaypalEligible] = useState(false);
  const [cardsEligible, setCardsEligible] = useState(false);

  const sdkRef = useRef<PayPalSdkInstance | null>(null);
  const cardSessionRef = useRef<PayPalCardFieldsSession | null>(null);
  const esitefOrderIdRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  const numberRef = useRef<HTMLDivElement>(null);
  const expiryRef = useRef<HTMLDivElement>(null);
  const cvvRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);
  const walletClickRef = useRef<(() => void) | null>(null);

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

  const createPayPalOrder = useCallback(async (): Promise<{ orderId: string }> => {
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
              }
            : { courseSlug, currency }
        ),
      }
    );
    const data = await readJsonResponse<OrderResponse & { error?: string }>(res);
    if (!res.ok || !data.paypalOrderId || !data.orderId) {
      throw new Error(data.error ?? "No se pudo crear la orden.");
    }
    esitefOrderIdRef.current = data.orderId;
    return { orderId: data.paypalOrderId };
  }, [courseSlug, currency, presencial]);

  // 1) Load SDK + eligibility. Mount hosts stay in DOM from first paint.
  useEffect(() => {
    mountedRef.current = true;

    async function init() {
      try {
        await loadPayPalSdkV6(sdkMode);
        if (!mountedRef.current || !window.paypal) {
          throw new Error("PayPal SDK no disponible.");
        }

        const locale = paypalLocaleForCurrency(currency);
        const sdk = await window.paypal.createInstance({
          clientId,
          components: ["paypal-payments", "card-fields"],
          pageType: "checkout",
          ...(locale ? { locale } : {}),
        });

        const methods = await sdk.findEligibleMethods({ currencyCode: currency });
        const canPayPal = methods.isEligible("paypal");
        const canCards = methods.isEligible("advanced_cards");

        if (!mountedRef.current) return;

        sdkRef.current = sdk;
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
      sdkRef.current = null;
      cardSessionRef.current = null;
      esitefOrderIdRef.current = null;
    };
  }, [sdkMode, clientId, currency]);

  // 2) Mount PayPal wallet alongside card fields when eligible.
  useEffect(() => {
    if (status !== "ready" || !paypalEligible) return;
    const sdk = sdkRef.current;
    const walletHost = walletRef.current;
    if (!sdk || !walletHost) return;

    walletHost.replaceChildren();
    const walletButton = document.createElement("paypal-button");
    walletHost.appendChild(walletButton);

    const session = sdk.createPayPalOneTimePaymentSession({
      async onApprove(data) {
        try {
          setStatus("paying");
          await capturePayment(data.orderId);
        } catch (err) {
          setStatus("ready");
          setError(
            err instanceof Error ? err.message : "Error al confirmar el pago."
          );
        }
      },
      onCancel() {
        setStatus("ready");
      },
      onError(err) {
        console.error("[paypal-checkout]", err);
        setStatus("ready");
        setError("El pago con PayPal no se completó.");
      },
    });

    const walletHandler = async () => {
      try {
        setMethod("paypal");
        setStatus("paying");
        setError("");
        await session.start({ presentationMode: "auto" }, createPayPalOrder());
        if (mountedRef.current) setStatus("ready");
      } catch (err) {
        setStatus("ready");
        setError(
          err instanceof Error ? err.message : "No se pudo iniciar PayPal."
        );
      }
    };
    walletClickRef.current = walletHandler;
    walletButton.addEventListener("click", walletHandler);

    return () => {
      walletButton.removeEventListener("click", walletHandler);
      walletHost.replaceChildren();
      walletClickRef.current = null;
    };
  }, [
    status,
    paypalEligible,
    capturePayment,
    createPayPalOrder,
  ]);

  // 3) Mount card fields while the card form is visible.
  useEffect(() => {
    if (status !== "ready" || !cardsEligible) return;
    const sdk = sdkRef.current;
    if (!sdk) return;

    let cancelled = false;
    let numberHost: HTMLDivElement | null = null;
    let expiryHost: HTMLDivElement | null = null;
    let cvvHost: HTMLDivElement | null = null;

    // Wait one frame so hosts are laid out before PayPal injects iframes.
    const raf = requestAnimationFrame(() => {
      if (cancelled) return;
      numberHost = numberRef.current;
      expiryHost = expiryRef.current;
      cvvHost = cvvRef.current;
      if (!numberHost || !expiryHost || !cvvHost) return;

      numberHost.replaceChildren();
      expiryHost.replaceChildren();
      cvvHost.replaceChildren();

      const cardSession = sdk.createCardFieldsOneTimePaymentSession();
      cardSessionRef.current = cardSession;

      numberHost.appendChild(
        cardSession.createCardFieldsComponent({
          type: "number",
          placeholder: "Número de tarjeta",
        })
      );
      expiryHost.appendChild(
        cardSession.createCardFieldsComponent({
          type: "expiry",
          placeholder: "MM/AA",
        })
      );
      cvvHost.appendChild(
        cardSession.createCardFieldsComponent({
          type: "cvv",
          placeholder: "CVV",
        })
      );
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      cardSessionRef.current = null;
      numberHost?.replaceChildren();
      expiryHost?.replaceChildren();
      cvvHost?.replaceChildren();
      numberRef.current?.replaceChildren();
      expiryRef.current?.replaceChildren();
      cvvRef.current?.replaceChildren();
    };
  }, [status, method, cardsEligible]);

  async function payWithCard() {
    setMethod("card");
    const cardSession = cardSessionRef.current;
    if (!cardSession) {
      setError("Los campos de tarjeta aún no están listos. Espera un segundo e intenta de nuevo.");
      return;
    }

    setStatus("paying");
    setError("");

    let paypalOrderId: string;
    try {
      ({ orderId: paypalOrderId } = await createPayPalOrder());
    } catch (err) {
      setStatus("ready");
      setError(err instanceof Error ? err.message : "No se pudo crear la orden.");
      return;
    }

    try {
      console.info("[paypal-card] submit start", paypalOrderId);
      const countryCode = paypalBillingCountryForCurrency(currency);
      const { state, data } = await withTimeout(
        cardSession.submit(paypalOrderId, {
          billingAddress: {
            countryCode,
            postalCode: countryCode === "US" ? "10001" : "1000",
          },
        }),
        45_000,
        "PayPal no respondió al enviar la tarjeta. Permite ventanas emergentes o usa el botón PayPal."
      );
      console.info("[paypal-card] submit result", state, data);

      if (state === "succeeded") {
        await capturePayment(data?.orderId ?? paypalOrderId);
        return;
      }

      if (state === "canceled") {
        setStatus("ready");
        setError("Autenticación cancelada. Puedes intentar de nuevo.");
        return;
      }

      setStatus("ready");
      setError(data?.message ?? "No se pudo procesar la tarjeta.");
    } catch (err) {
      console.error("[paypal-card] submit error", err);
      setStatus("ready");
      setError(err instanceof Error ? err.message : "Error al procesar el pago.");
    }
  }

  const showUi = status !== "unsupported";
  const thumbSrc = courseThumbnailUrl || COURSE_THUMB_PLACEHOLDER;
  const isHttps =
    typeof window !== "undefined" && window.location.protocol === "https:";

  return (
    <div className="paypal-checkout-page">
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
          <p className="paypal-checkout-page__payment-intro">
            Ingresa los datos de tu tarjeta
          </p>

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
                  <div className="paypal-checkout-page__card-heading">
                    <span>Tarjeta de crédito o débito</span>
                    <PaymentCardBrandLogos />
                  </div>
                  <div className="paypal-checkout-page__field-label">
                    <span>Número de tarjeta</span>
                    <div className="paypal-checkout-page__field-shell">
                      <div
                        className="paypal-checkout-page__card-field"
                        ref={numberRef}
                      />
                    </div>
                  </div>
                  <div className="paypal-checkout-page__card-row">
                    <div className="paypal-checkout-page__field-label">
                      <span>Expiración</span>
                      <div className="paypal-checkout-page__field-shell">
                        <div
                          className="paypal-checkout-page__card-field"
                          ref={expiryRef}
                        />
                      </div>
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
                      <div className="paypal-checkout-page__field-shell">
                        <div
                          className="paypal-checkout-page__card-field"
                          ref={cvvRef}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="paypal-checkout-page__submit"
                    onClick={() => void payWithCard()}
                    disabled={status === "paying"}
                  >
                    {status === "paying" && method === "card"
                      ? "Procesando…"
                      : "Continue"}
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
