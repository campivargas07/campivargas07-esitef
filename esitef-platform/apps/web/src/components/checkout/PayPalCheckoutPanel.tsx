"use client";

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
  PayPalSdkMode,
} from "@/lib/paypal-sdk-v6";
import { readJsonResponse } from "@/lib/read-json-response";

import "@/styles/paypal-checkout.css";

type Props = {
  courseSlug: string;
  courseTitle: string;
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
  amountMinor,
  currency,
  clientId,
  sdkMode,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState("");
  const [method, setMethod] = useState<PayMethod>("card");
  const [paypalEligible, setPaypalEligible] = useState(false);
  const [cardsEligible, setCardsEligible] = useState(false);

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

        setPaypalEligible(canPayPal);
        setCardsEligible(canCards);
        setMethod(canCards ? "card" : canPayPal ? "paypal" : "card");

        if (!canPayPal && !canCards) {
          setStatus("unsupported");
          return;
        }

        if (canPayPal && walletRef.current) {
          walletRef.current.replaceChildren();
          const button = document.createElement("paypal-button");
          walletRef.current.appendChild(button);

          const session = sdk.createPayPalOneTimePaymentSession({
            async onApprove(data) {
              try {
                setStatus("paying");
                await capturePayment(data.orderId);
              } catch (err) {
                setStatus("error");
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
              setStatus("error");
              setError("El pago con PayPal no se completó.");
            },
          });

          const onWalletClick = async () => {
            try {
              setStatus("paying");
              setError("");
              await session.start({ presentationMode: "popup" }, createPayPalOrder);
              setStatus("ready");
            } catch (err) {
              setStatus("error");
              setError(
                err instanceof Error ? err.message : "No se pudo iniciar PayPal."
              );
            }
          };
          walletClickRef.current = onWalletClick;
          button.addEventListener("click", onWalletClick);
        }

        if (
          canCards &&
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
        }

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
      cardSessionRef.current = null;
      esitefOrderIdRef.current = null;
      const handler = walletClickRef.current;
      const button = walletRef.current?.querySelector("paypal-button");
      if (button && handler) button.removeEventListener("click", handler);
      walletClickRef.current = null;
    };
  }, [sdkMode, clientId, currency, capturePayment, createPayPalOrder]);

  async function payWithCard() {
    const cardSession = cardSessionRef.current;
    if (!cardSession) return;

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

      setStatus("error");
      setError(data?.message ?? "No se pudo procesar la tarjeta.");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Error al procesar el pago.");
    }
  }

  return (
    <div className="paypal-checkout-page">
      <nav className="paypal-checkout-page__breadcrumb" aria-label="Ruta">
        <Link href={`/cursos/${courseSlug}`}>Curso</Link>
        <span aria-hidden="true">/</span>
        <span>Pago</span>
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

          {status !== "unsupported" && status !== "loading" && (
            <>
              <div className="paypal-checkout-page__methods" role="radiogroup" aria-label="Método de pago">
                {cardsEligible && (
                  <label className="paypal-checkout-page__method">
                    <input
                      type="radio"
                      name="pay-method"
                      value="card"
                      checked={method === "card"}
                      onChange={() => setMethod("card")}
                    />
                    <span>Tarjeta de crédito o débito</span>
                  </label>
                )}
                {paypalEligible && (
                  <label className="paypal-checkout-page__method">
                    <input
                      type="radio"
                      name="pay-method"
                      value="paypal"
                      checked={method === "paypal"}
                      onChange={() => setMethod("paypal")}
                    />
                    <span>PayPal</span>
                  </label>
                )}
              </div>

              {method === "card" && cardsEligible && (
                <div className="paypal-checkout-page__card-form">
                  <div className="paypal-checkout-page__card-field" ref={numberRef} />
                  <div className="paypal-checkout-page__card-row">
                    <div className="paypal-checkout-page__card-field" ref={expiryRef} />
                    <div className="paypal-checkout-page__card-field" ref={cvvRef} />
                  </div>
                  <button
                    type="button"
                    className="hero-btn paypal-checkout-page__submit"
                    onClick={() => void payWithCard()}
                    disabled={status === "paying"}
                  >
                    {status === "paying" ? "Procesando…" : "Pagar"}
                  </button>
                </div>
              )}

              {method === "paypal" && paypalEligible && (
                <div className="paypal-checkout-page__wallet">
                  <p className="paypal-checkout-page__wallet-hint">
                    Serás redirigido a PayPal para completar el pago de forma segura.
                  </p>
                  <div ref={walletRef} />
                </div>
              )}
            </>
          )}

          <p className="paypal-checkout-page__secure">Pago seguro procesado por PayPal</p>
        </section>

        <aside className="paypal-checkout-page__summary" aria-label="Resumen del pedido">
          <h2 className="paypal-checkout-page__summary-title">Resumen</h2>
          <p className="paypal-checkout-page__summary-item">1 curso</p>
          <p className="paypal-checkout-page__summary-course">{courseTitle}</p>
          <dl className="paypal-checkout-page__totals">
            <div>
              <dt>Total</dt>
              <dd>{formatOnlineMoney(amountMinor, currency)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
