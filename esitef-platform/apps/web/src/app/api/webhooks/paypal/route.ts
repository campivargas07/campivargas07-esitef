import { NextResponse } from "next/server";
import {
  isWebhookProcessed,
  markWebhookProcessed,
} from "@/lib/lms";
import { fulfillPaidOrder } from "@/lib/paypal-fulfillment";
import { verifyPayPalWebhookSignature } from "@/lib/paypal";

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
  const rawBody = await req.text();
  let event: PayPalWebhookEvent;
  try {
    event = JSON.parse(rawBody) as PayPalWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!event.id || !event.event_type) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const webhookId = process.env.PAYPAL_WEBHOOK_ID?.trim();
  if (webhookId) {
    const valid = await verifyPayPalWebhookSignature(req.headers, event);
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "PAYPAL_WEBHOOK_ID not configured" },
      { status: 500 }
    );
  }

  if (await isWebhookProcessed("paypal", event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    if (
      event.event_type === "PAYMENT.CAPTURE.COMPLETED" ||
      event.event_type === "CHECKOUT.ORDER.APPROVED"
    ) {
      const orderId = resolveOrderId(event);
      if (orderId) {
        await fulfillPaidOrder(orderId, event.resource?.id ?? undefined);
      }
    }

    await markWebhookProcessed("paypal", event.id, event.event_type, event);
  } catch (err) {
    console.error("[webhooks/paypal]", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
