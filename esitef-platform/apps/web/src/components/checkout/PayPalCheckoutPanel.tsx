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
import { paypalLocaleForCurrency } from "@/lib/paypal-locale";
import type {
  PayPalCardFieldsSession,
  PayPalSdkInstance,
  PayPalSdkMode,
} from "@/lib/paypal-sdk-v6";
import { readJsonResponse } from "@/lib/read-json-response";

import "@/styles/paypal-checkout.css";

type Props = {
  courseSlug: string;
  courseTitle: string;
  courseThumbnailUrl?: string | null;
  amountMinor: number;
  currency: OnlineCurrency;
  clientId: string;
  sdkMode: PayPalSdkMode;
};

type PayMethod = "paypal" | "card";
type Status = "loading" | "ready" | "paying" | "error" | "unsupported";

type OrderResponse = {
  orderId: string;
  paypalOrderId: string;
};

export function PayPalCheckoutPanel({
  courseSlug,
  courseTitle,
  courseThumbnailUrl,
  amountMinor,
  currency,
  clientId,
  sdkMode,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState("");
  const [method, setMethod] = useState<PayMethod>("paypal");
  const [paypalEligible, setPaypalEligible] = useState(false);
  const [cardsEligible, setCardsEligible] = useState(false);

  const sdkRef = useRef<PayPalSdkInstance | null>(null);
  const cardSessionRef = useRef<PayPalCardFieldsSession | null>(null);
  const esitefOrderIdRef = useRef<string | null>(null);
  const fieldsMountedRef = useRef(false);
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
    const res = await fetch("/api/checkout/paypal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseSlug, currency }),
    });
    const data = await readJsonResponse<OrderResponse & { error?: string }>(res);
    if (!res.ok || !data.paypalOrderId || !data.orderId) {
      throw new Error(data.error ?? "No se pudo crear la orden.");
    }
    esitefOrderIdRef.current = data.orderId;
    return { orderId: data.paypalOrderId };
  }, [courseSlug, currency]);

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

        setMethod(canPayPal ? "paypal" : "card");
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
      fieldsMountedRef.current = false;
      const handler = walletClickRef.current;
      const button = walletRef.current?.querySelector("paypal-button");
      if (button && handler) button.removeEventListener("click", handler);
      walletClickRef.current = null;
    };
  }, [sdkMode, clientId, currency]);

  // 2) Mount card fields + PayPal button after hosts exist and eligibility is known.
  useEffect(() => {
    if (status !== "ready" || fieldsMountedRef.current) return;
    const sdk = sdkRef.current;
    if (!sdk) return;

    let didMount = false;

    if (
      cardsEligible &&
      numberRef.current &&
      expiryRef.current &&
      cvvRef.current
    ) {
      numberRef.current.replaceChildren();
      expiryRef.current.replaceChildren();
      cvvRef.current.replaceChildren();

      const cardSession = sdk.createCardFieldsOneTimePaymentSession();
      cardSessionRef.current = cardSession;

      numberRef.current.appendChild(
        cardSession.createCardFieldsComponent({
          type: "number",
          placeholder: "Número de tarjeta",
        })
      );
      expiryRef.current.appendChild(
        cardSession.createCardFieldsComponent({
          type: "expiry",
          placeholder: "MM/AA",
        })
      );
      cvvRef.current.appendChild(
        cardSession.createCardFieldsComponent({
          type: "cvv",
          placeholder: "CVV",
        })
      );
      didMount = true;
    }

    if (paypalEligible && walletRef.current) {
      walletRef.current.replaceChildren();
      const button = document.createElement("paypal-button");
      walletRef.current.appendChild(button);

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

      const onWalletClick = async () => {
        try {
          setStatus("paying");
          setError("");
          await session.start(
            { presentationMode: "auto" },
            createPayPalOrder
          );
          if (mountedRef.current) setStatus("ready");
        } catch (err) {
          setStatus("ready");
          setError(
            err instanceof Error ? err.message : "No se pudo iniciar PayPal."
          );
        }
      };
      walletClickRef.current = onWalletClick;
      button.addEventListener("click", onWalletClick);
      didMount = true;
    }

    if (didMount) fieldsMountedRef.current = true;
  }, [
    status,
    cardsEligible,
    paypalEligible,
    capturePayment,
    createPayPalOrder,
  ]);

  async function payWithCard() {
    const cardSession = cardSessionRef.current;
    if (!cardSession) {
      setError("Los campos de tarjeta aún no están listos. Recarga la página.");
      return;
    }

    setStatus("paying");
    setError("");

    try {
      const { orderId: paypalOrderId } = await createPayPalOrder();
      const { state, data } = await cardSession.submit(paypalOrderId);

      if (state === "succeeded" && data?.orderId) {
        await capturePayment(data.orderId);
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
      setStatus("ready");
      setError(err instanceof Error ? err.message : "Error al procesar el pago.");
    }
  }

  const showUi = status !== "unsupported";

  const cardInactive = status === "loading" || method !== "card" || !cardsEligible;
  const walletInactive = status === "loading" || method !== "paypal" || !paypalEligible;

  return (
    <div className="paypal-checkout-page">
      <nav className="paypal-checkout-page__breadcrumb" aria-label="Ruta">
        <Link href={`/cursos/${courseSlug}`}>← Volver al curso</Link>
      </nav>

      <div className="paypal-checkout-page__layout">
        <section className="paypal-checkout-page__payment" aria-label="Forma de pago">
          <h1 className="paypal-checkout-page__heading">Forma de pago</h1>

          {status === "loading" && (
            <p className="paypal-checkout-page__status">Cargando métodos de pago…</p>
          )}

          {status === "unsupported" && (
            <p className="paypal-checkout-page__error" role="alert">
              PayPal no ofrece métodos de pago para esta moneda en tu región.
            </p>
          )}

          {error && (
            <p className="paypal-checkout-page__error" role="alert">
              {error}
            </p>
          )}

          {showUi && (
            <div
              className={`paypal-checkout-page__options${
                status === "loading" ? " is-inactive" : ""
              }`}
              role="radiogroup"
              aria-label="Método de pago"
              aria-hidden={status === "loading"}
            >
              {cardsEligible && (
                <div
                  className={`paypal-checkout-page__option${
                    method === "card" ? " is-selected" : ""
                  }`}
                >
                  <label className="paypal-checkout-page__option-head">
                    <input
                      type="radio"
                      name="pay-method"
                      value="card"
                      checked={method === "card"}
                      onChange={() => setMethod("card")}
                    />
                    <span className="paypal-checkout-page__option-label">
                      Tarjeta de crédito o débito
                    </span>
                    <span className="paypal-checkout-page__brands" aria-hidden="true">
                      <span className="pp-brand pp-brand--visa">VISA</span>
                      <span className="pp-brand pp-brand--mc">
                        <span className="pp-brand__dot pp-brand__dot--red" />
                        <span className="pp-brand__dot pp-brand__dot--yellow" />
                      </span>
                      <span className="pp-brand pp-brand--amex">AMEX</span>
                    </span>
                  </label>

                  <div
                    className={`paypal-checkout-page__card-form${
                      cardInactive ? " is-inactive" : ""
                    }`}
                    aria-hidden={cardInactive}
                  >
                    <label className="paypal-checkout-page__field-label">
                      Número de tarjeta
                      <div className="paypal-checkout-page__card-field" ref={numberRef} />
                    </label>
                    <div className="paypal-checkout-page__card-row">
                      <label className="paypal-checkout-page__field-label">
                        Caducidad
                        <div
                          className="paypal-checkout-page__card-field"
                          ref={expiryRef}
                        />
                      </label>
                      <label className="paypal-checkout-page__field-label">
                        CVV
                        <div
                          className="paypal-checkout-page__card-field"
                          ref={cvvRef}
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      className="paypal-checkout-page__submit"
                      onClick={() => void payWithCard()}
                      disabled={status === "paying" || status === "loading"}
                    >
                      {status === "paying" ? "Procesando…" : "Continuar"}
                    </button>
                  </div>
                </div>
              )}

              {paypalEligible && (
                <div
                  className={`paypal-checkout-page__option${
                    method === "paypal" ? " is-selected" : ""
                  }`}
                >
                  <label className="paypal-checkout-page__option-head">
                    <input
                      type="radio"
                      name="pay-method"
                      value="paypal"
                      checked={method === "paypal"}
                      onChange={() => setMethod("paypal")}
                    />
                    <span
                      className="paypal-checkout-page__option-label pp-paypal-logo"
                      aria-label="PayPal"
                    >
                      <span className="pp-paypal-logo__pay">Pay</span>
                      <span className="pp-paypal-logo__pal">Pal</span>
                    </span>
                  </label>

                  <div
                    className={`paypal-checkout-page__wallet${
                      walletInactive ? " is-inactive" : ""
                    }`}
                    aria-hidden={walletInactive}
                  >
                    <p className="paypal-checkout-page__wallet-hint">
                      Serás llevado a PayPal para completar el pago de forma segura.
                    </p>
                    <div ref={walletRef} />
                  </div>
                </div>
              )}
            </div>
          )}

          <p className="paypal-checkout-page__secure">Pago seguro procesado por PayPal</p>
        </section>

        <aside className="paypal-checkout-page__summary" aria-label="Resumen del pedido">
          <div className="paypal-checkout-page__summary-head">
            <h2 className="paypal-checkout-page__summary-title">Resumen del pedido</h2>
            <span className="paypal-checkout-page__summary-count">1 curso</span>
          </div>

          {courseThumbnailUrl && (
            <div className="paypal-checkout-page__summary-media">
              <Image
                src={courseThumbnailUrl}
                alt={courseTitle}
                width={640}
                height={400}
                unoptimized
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}

          <p className="paypal-checkout-page__summary-course">{courseTitle}</p>

          <dl className="paypal-checkout-page__totals">
            <div className="paypal-checkout-page__totals-row">
              <dt>Subtotal</dt>
              <dd>{formatOnlineMoney(amountMinor, currency)}</dd>
            </div>
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
