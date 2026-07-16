import Link from "next/link";
import { confirmPayPalCheckoutByToken } from "@/lib/paypal-fulfillment";
import { confirmStripeCheckoutBySessionId } from "@/lib/stripe-fulfillment";

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

  if (params.session_id) {
    const result = await confirmStripeCheckoutBySessionId(params.session_id);
    confirmed = result.confirmed;
    presencial = result.isPresencial;
  } else if (params.provider === "paypal" && params.token) {
    const result = await confirmPayPalCheckoutByToken(params.token);
    confirmed = result.confirmed;
    presencial = result.isPresencial;
  }

  return (
    <div className="container" style={{ padding: "3rem 0" }}>
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
