"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
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
  open: boolean;
  onClose: () => void;
  courseSlug: string;
  courseTitle: string;
  amountMinor: number;
  currency: OnlineCurrency;
  clientId: string;
  sdkMode: PayPalSdkMode;
};

type OrderResponse = {
  orderId: string;
  paypalOrderId: string;
};

export function PayPalCheckoutModal({
  open,
  onClose,
  courseSlug,
  courseTitle,
  amountMinor,
  currency,
  clientId,
  sdkMode,
}: Props) {
  const router = useRouter();
  const titleId = useId();
  const [status, setStatus] = useState<
    "loading" | "ready" | "paying" | "error" | "unsupported"
  >("loading");
  const [error, setError] = useState("");
  const [paypalEligible, setPaypalEligible] = useState(false);
  const [cardsEligible, setCardsEligible] = useState(false);

  const cardSessionRef = useRef<PayPalCardFieldsSession | null>(null);
  const esitefOrderIdRef = useRef<string | null>(null);
  const mountedRef = useRef(false);

  const numberRef = useRef<HTMLDivElement>(null);
  const expiryRef = useRef<HTMLDivElement>(null);
  const cvvRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);
  const paypalClickHandlerRef = useRef<(() => void) | null>(null);

  const capturePayment = useCallback(
    async (paypalOrderId: string) => {
      const orderId = esitefOrderIdRef.current;
      if (!orderId) {
        throw new Error("Orden interna no encontrada.");
      }

      const res = await fetch("/api/checkout/paypal/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paypalOrderId }),
      });
      const data = await readJsonResponse<{ ok?: boolean; error?: string }>(res);
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "No se pudo confirmar el pago.");
      }

      onClose();
      router.push(
        `/gracias?provider=paypal&token=${encodeURIComponent(paypalOrderId)}`
      );
    },
    [onClose, router]
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
    if (!open) return;

    mountedRef.current = true;
    setStatus("loading");
    setError("");

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
              console.error("[paypal-modal]", err);
              setStatus("error");
              setError("El pago con PayPal no se completó. Intenta de nuevo.");
            },
          });

          const onWalletClick = async () => {
            try {
              setStatus("paying");
              await session.start({ presentationMode: "modal" }, createPayPalOrder);
              setStatus("ready");
            } catch (err) {
              setStatus("error");
              setError(
                err instanceof Error ? err.message : "No se pudo iniciar PayPal."
              );
            }
          };
          paypalClickHandlerRef.current = onWalletClick;
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

          const numberField = cardSession.createCardFieldsComponent({
            type: "number",
            placeholder: "Número de tarjeta",
          });
          const expiryField = cardSession.createCardFieldsComponent({
            type: "expiry",
            placeholder: "MM/AA",
          });
          const cvvField = cardSession.createCardFieldsComponent({
            type: "cvv",
            placeholder: "CVV",
          });

          numberRef.current.appendChild(numberField);
          expiryRef.current.appendChild(expiryField);
          cvvRef.current.appendChild(cvvField);
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
      const handler = paypalClickHandlerRef.current;
      const button = walletRef.current?.querySelector("paypal-button");
      if (button && handler) {
        button.removeEventListener("click", handler);
      }
      paypalClickHandlerRef.current = null;
    };
  }, [open, sdkMode, clientId, currency, capturePayment, createPayPalOrder]);

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

  if (!open) return null;

  return (
    <div className="paypal-checkout" role="presentation">
      <button
        type="button"
        className="paypal-checkout__overlay"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        className="paypal-checkout__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          type="button"
          className="paypal-checkout__close"
          aria-label="Cerrar"
          onClick={onClose}
        >
          ×
        </button>

        <h2 id={titleId} className="paypal-checkout__title">
          Completar inscripción
        </h2>
        <p className="paypal-checkout__course">{courseTitle}</p>
        <p className="paypal-checkout__amount">
          {formatOnlineMoney(amountMinor, currency)}
        </p>

        {status === "loading" && (
          <p className="paypal-checkout__status">Cargando métodos de pago…</p>
        )}

        {status === "unsupported" && (
          <p className="paypal-checkout__error" role="alert">
            PayPal no ofrece métodos de pago para esta moneda en tu región.
          </p>
        )}

        {error && (
          <p className="paypal-checkout__error" role="alert">
            {error}
          </p>
        )}

        {status !== "unsupported" && (
          <div className="paypal-checkout__methods">
            {paypalEligible && (
              <div className="paypal-checkout__wallet" ref={walletRef} />
            )}

            {cardsEligible && (
              <div className="paypal-checkout__cards">
                {paypalEligible && (
                  <p className="paypal-checkout__divider">
                    <span>o paga con tarjeta</span>
                  </p>
                )}
                <div className="paypal-checkout__card-field" ref={numberRef} />
                <div className="paypal-checkout__card-row">
                  <div className="paypal-checkout__card-field" ref={expiryRef} />
                  <div className="paypal-checkout__card-field" ref={cvvRef} />
                </div>
                <button
                  type="button"
                  className="hero-btn paypal-checkout__pay-btn"
                  onClick={() => void payWithCard()}
                  disabled={status === "loading" || status === "paying"}
                >
                  {status === "paying" ? "Procesando…" : "Pagar con tarjeta"}
                </button>
              </div>
            )}
          </div>
        )}

        <p className="paypal-checkout__secure">
          Pago seguro procesado por PayPal
        </p>
      </div>
    </div>
  );
}
