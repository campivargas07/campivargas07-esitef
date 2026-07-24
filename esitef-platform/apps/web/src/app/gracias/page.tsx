import Link from "next/link";
import { confirmPayPalCheckoutByToken } from "@/lib/paypal-fulfillment";
import { confirmStripeCheckoutBySessionId } from "@/lib/stripe-fulfillment";
import {
  getPurchaseContextByPayPalToken,
  getPurchaseContextByStripeSession,
} from "@/lib/purchase-tracking";
import { TrackingEcommerceEvent } from "@/components/tracking/TrackingEvents";

export default async function GraciasPage({
  searchParams,
}: {
  searchParams: Promise<{
    session_id?: string;
    token?: string;
    provider?: string;
  }>;
}) {
  const params = await searchParams;
  let confirmed = false;
  let presencial = false;
  let purchase = null;

  if (params.session_id) {
    const result = await confirmStripeCheckoutBySessionId(params.session_id);
    confirmed = result.confirmed;
    presencial = result.isPresencial;
    if (confirmed) {
      purchase = await getPurchaseContextByStripeSession(params.session_id);
    }
  } else if (params.provider === "paypal" && params.token) {
    const result = await confirmPayPalCheckoutByToken(params.token);
    confirmed = result.confirmed;
    presencial = result.isPresencial;
    if (confirmed) {
      purchase = await getPurchaseContextByPayPalToken(params.token);
    }
  }

  return (
    <div className="container" style={{ padding: "3rem 0" }}>
      {purchase ? (
        <TrackingEcommerceEvent
          event="purchase"
          currency={purchase.currency}
          value={purchase.value}
          transactionId={purchase.transactionId}
          items={[
            {
              item_id: purchase.itemId,
              item_name: purchase.itemName,
              price: purchase.value,
              quantity: 1,
            },
          ]}
        />
      ) : null}
      <div className="card">
        <h1 style={{ fontFamily: "var(--font-heading)" }}>
          {presencial ? "¡Inscripción confirmada!" : "¡Gracias por tu compra!"}
        </h1>
        {confirmed ? (
          <p style={{ marginTop: "1rem", color: "var(--color-text-muted)" }}>
            {presencial
              ? "Tu pago fue confirmado. Te enviamos un email con los detalles de la inscripción."
              : "Tu pago fue confirmado y el acceso al curso ya está activo."}
          </p>
        ) : (
          <p style={{ marginTop: "1rem", color: "var(--color-text-muted)" }}>
            {presencial
              ? "Tu pago está siendo confirmado. Recibirás un email cuando la inscripción quede registrada."
              : "Tu pago está siendo confirmado. El acceso al curso se activará automáticamente cuando recibamos la confirmación del proveedor de pago."}
          </p>
        )}
        <Link href="/dashboard" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>
          Ir a mi cuenta
        </Link>
      </div>
    </div>
  );
}
