import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { orders } from "@esitef/db";
import { getDb } from "@/lib/db";
import { grantEnrollmentFromOrder } from "@/lib/lms";
import {
  confirmSesionOnlineBooking,
  getSesionOnlineBookingByOrderId,
} from "@/lib/sesiones-online-bookings";
import { createCalendarEvent } from "@/lib/google-calendar";
import {
  formatSessionDateLabel,
  formatTimeSlotLabel,
} from "@/lib/sesiones-online";
import { sendPresencialInscriptionConfirmation } from "@/lib/presencial-confirmation";
import { getStripe } from "@/lib/stripe";

async function fulfillSesionOnlineOrder(orderId: string): Promise<boolean> {
  const booking = await getSesionOnlineBookingByOrderId(orderId);
  if (!booking) return false;

  if (booking.status === "confirmed" && booking.googleEventId) {
    return true;
  }

  const googleEventId = await createCalendarEvent({
    title: `Sesión online ESITEF — ${booking.name}`,
    description: [
      `Cliente: ${booking.name}`,
      `Email: ${booking.email}`,
      booking.phone ? `Teléfono: ${booking.phone}` : null,
      `Fecha: ${formatSessionDateLabel(booking.date)}`,
      `Hora: ${formatTimeSlotLabel(booking.timeSlot)}`,
    ]
      .filter(Boolean)
      .join("\n"),
    startsAt: booking.startsAt,
    endsAt: booking.endsAt,
    attendeeEmail: booking.email,
  });

  await confirmSesionOnlineBooking(orderId, googleEventId);
  return true;
}

export async function fulfillOrderFromStripeCheckoutSession(
  session: Stripe.Checkout.Session,
) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return false;

  const paid =
    session.payment_status === "paid" ||
    (session.status === "complete" && session.mode === "payment");
  if (!paid) return false;

  const db = getDb();
  const [existing] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!existing) return false;

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;

  await db
    .update(orders)
    .set({
      status: "paid",
      paidAt: existing.paidAt ?? new Date(),
      providerOrderId: session.id,
      providerCustomerId:
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id ?? null,
      metadata: {
        ...((existing.metadata as Record<string, unknown>) ?? {}),
        ...(subscriptionId
          ? { subscriptionId, checkoutMode: session.mode }
          : {}),
      },
    })
    .where(eq(orders.id, orderId));

  if (existing.metadata?.type === "sesiones-online") {
    await fulfillSesionOnlineOrder(orderId);
    return true;
  }

  if (existing.metadata?.type === "presencial") {
    await sendPresencialInscriptionConfirmation(orderId);
    return true;
  }

  await grantEnrollmentFromOrder(orderId);
  return true;
}

export async function confirmStripeCheckoutBySessionId(
  stripeSessionId: string
): Promise<{ confirmed: boolean; isPresencial: boolean }> {
  const session = await getStripe().checkout.sessions.retrieve(stripeSessionId);
  const confirmed = await fulfillOrderFromStripeCheckoutSession(session);
  return {
    confirmed,
    isPresencial: session.metadata?.type === "presencial",
  };
}
