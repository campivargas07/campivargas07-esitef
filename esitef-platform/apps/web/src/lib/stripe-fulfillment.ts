import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { orders } from "@esitef/db";
import { getDb } from "@/lib/db";
import { grantEnrollmentFromOrder } from "@/lib/lms";
import { confirmSesionOnlineBooking } from "@/lib/sesiones-online-bookings";
import { getStripe } from "@/lib/stripe";

export async function fulfillOrderFromStripeCheckoutSession(
  session: Stripe.Checkout.Session
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
    confirmSesionOnlineBooking(orderId);
    return true;
  }

  await grantEnrollmentFromOrder(orderId);
  return true;
}

export async function confirmStripeCheckoutBySessionId(stripeSessionId: string) {
  const session = await getStripe().checkout.sessions.retrieve(stripeSessionId);
  return fulfillOrderFromStripeCheckoutSession(session);
}
