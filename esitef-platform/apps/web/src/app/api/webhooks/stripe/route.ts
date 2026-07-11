import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { orders, orderItems } from "@esitef/db";
import { getStripe } from "@/lib/stripe";
import { getDb } from "@/lib/db";
import {
  grantEnrollmentFromOrder,
  isWebhookProcessed,
  markWebhookProcessed,
} from "@/lib/lms";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (await isWebhookProcessed("stripe", event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const db = getDb();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        if (orderId) {
          await db
            .update(orders)
            .set({
              status: "paid",
              paidAt: new Date(),
              providerOrderId: session.id,
              providerCustomerId:
                typeof session.customer === "string"
                  ? session.customer
                  : session.customer?.id ?? null,
            })
            .where(eq(orders.id, orderId));
          await grantEnrollmentFromOrder(orderId);
        }
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        if (orderId) {
          await db
            .update(orders)
            .set({ status: "cancelled" })
            .where(eq(orders.id, orderId));
        }
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const orderId = charge.metadata?.orderId;
        if (orderId) {
          await db
            .update(orders)
            .set({ status: "refunded" })
            .where(eq(orders.id, orderId));
        }
        break;
      }
      default:
        break;
    }

    await markWebhookProcessed("stripe", event.id, event.type, event.data.object);
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
