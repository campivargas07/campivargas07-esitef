import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { orders } from "@esitef/db";
import { getDb } from "@/lib/db";
import {
  grantEnrollmentFromOrder,
  isWebhookProcessed,
  markWebhookProcessed,
} from "@/lib/lms";

type PayPalWebhookEvent = {
  id: string;
  event_type: string;
  resource?: {
    id?: string;
    custom_id?: string;
    purchase_units?: Array<{ custom_id?: string }>;
    supplementary_data?: {
      related_ids?: { order_id?: string };
    };
  };
};

function resolveOrderId(event: PayPalWebhookEvent): string | null {
  const resource = event.resource;
  if (!resource) return null;

  if (resource.custom_id) return resource.custom_id;

  const unitId = resource.purchase_units?.[0]?.custom_id;
  if (unitId) return unitId;

  return null;
}

export async function POST(req: Request) {
  let event: PayPalWebhookEvent;
  try {
    event = (await req.json()) as PayPalWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!event.id || !event.event_type) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  if (await isWebhookProcessed("paypal", event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const db = getDb();

  try {
    if (
      event.event_type === "PAYMENT.CAPTURE.COMPLETED" ||
      event.event_type === "CHECKOUT.ORDER.APPROVED"
    ) {
      const orderId = resolveOrderId(event);
      if (orderId) {
        await db
          .update(orders)
          .set({
            status: "paid",
            paidAt: new Date(),
            providerOrderId: event.resource?.id ?? undefined,
          })
          .where(eq(orders.id, orderId));
        await grantEnrollmentFromOrder(orderId);
      }
    }

    await markWebhookProcessed("paypal", event.id, event.event_type, event);
  } catch (err) {
    console.error("[webhooks/paypal]", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
