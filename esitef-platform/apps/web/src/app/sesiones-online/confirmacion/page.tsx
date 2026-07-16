import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { orders } from "@esitef/db";
import { getDb } from "@/lib/db";
import {
  formatSessionDateLabel,
  formatTimeSlotLabel,
} from "@/lib/sesiones-online";
import { confirmStripeCheckoutBySessionId } from "@/lib/stripe-fulfillment";
import {
  fulfillSimSesionOnlineOrder,
  parseSimSessionId,
} from "@/lib/sesiones-online-simulation";
import "@/styles/sesiones-online.css";

export const metadata: Metadata = {
  title: "Reserva confirmada — Sesiones online | ESITEF",
  description: "Confirmación de tu cita de sesión online con ESITEF.",
};

type BookingDetails = {
  date: string;
  timeSlot: string;
  customerName: string;
  customerEmail: string;
};

async function getBookingFromSession(
  sessionId: string
): Promise<{ confirmed: boolean; booking: BookingDetails | null; simulation?: boolean }> {
  const simOrderId = parseSimSessionId(sessionId);
  if (simOrderId) {
    const confirmed = await fulfillSimSesionOnlineOrder(simOrderId);
    const db = getDb();
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, simOrderId))
      .limit(1);

    if (!order?.metadata || order.metadata.type !== "sesiones-online") {
      return { confirmed, booking: null, simulation: true };
    }

    const meta = order.metadata as Record<string, string>;
    return {
      confirmed,
      simulation: true,
      booking:
        meta.date && meta.timeSlot
          ? {
              date: meta.date,
              timeSlot: meta.timeSlot,
              customerName: meta.customerName ?? "",
              customerEmail: meta.customerEmail ?? "",
            }
          : null,
    };
  }

  const stripeResult = await confirmStripeCheckoutBySessionId(sessionId);
  const confirmed = stripeResult.confirmed;
  const db = getDb();
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.providerOrderId, sessionId))
    .limit(1);

  if (!order?.metadata || order.metadata.type !== "sesiones-online") {
    return { confirmed, booking: null };
  }

  const meta = order.metadata as Record<string, string>;
  if (!meta.date || !meta.timeSlot) {
    return { confirmed, booking: null };
  }

  return {
    confirmed: confirmed || order.status === "paid",
    booking: {
      date: meta.date,
      timeSlot: meta.timeSlot,
      customerName: meta.customerName ?? "",
      customerEmail: meta.customerEmail ?? "",
    },
  };
}

export default async function SesionesOnlineConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;

  let confirmed = false;
  let booking: BookingDetails | null = null;
  let simulation = false;

  if (sessionId) {
    const result = await getBookingFromSession(sessionId);
    confirmed = result.confirmed;
    booking = result.booking;
    simulation = result.simulation ?? false;
  }

  return (
    <div className="sesiones-online-page sesiones-online-page--confirm">
      <div className="sesiones-online-confirm">
        <span className="sesiones-online-hero__eyebrow">Sesiones online</span>
        <h1>{confirmed ? "¡Cita confirmada!" : "Procesando tu reserva"}</h1>

        {simulation && (
          <p className="sesiones-online-sim-banner sesiones-online-sim-banner--inline" role="status">
            Simulación — sin pago Stripe ni Google Calendar
          </p>
        )}

        {booking ? (
          <div className="sesiones-online-confirm__card" role="status">
            <p>
              Hemos registrado tu sesión para{" "}
              <strong>{formatSessionDateLabel(booking.date)}</strong> a las{" "}
              <strong>{formatTimeSlotLabel(booking.timeSlot)}</strong>.
            </p>
            {booking.customerName && (
              <p>
                Titular: <strong>{booking.customerName}</strong>
              </p>
            )}
            {booking.customerEmail && (
              <p>
                Confirmación enviada a: <strong>{booking.customerEmail}</strong>
              </p>
            )}
            {!confirmed && (
              <p className="sesiones-online-confirm__pending">
                El pago se está verificando. Recibirás un correo cuando quede
                confirmado.
              </p>
            )}
          </div>
        ) : (
          <p className="sesiones-online-confirm__pending">
            {sessionId
              ? "Estamos validando el pago. Si ya completaste el checkout, la cita quedará confirmada en breve."
              : "No encontramos los datos de la reserva. Vuelve al calendario para reservar una sesión."}
          </p>
        )}

        <div className="sesiones-online-confirm__actions">
          <Link href="/sesiones-online" className="sesiones-online-booking__submit">
            Volver al calendario
          </Link>
          <Link href="/contacto" className="sesiones-online-booking__cancel">
            Contactar con ESITEF
          </Link>
        </div>
      </div>
    </div>
  );
}
