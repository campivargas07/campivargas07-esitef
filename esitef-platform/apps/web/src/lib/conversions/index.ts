import { eq } from "drizzle-orm";
import { orderItems, orders, users } from "@esitef/db";
import { getDb } from "@/lib/db";
import type { CheckoutAttribution } from "@/lib/attribution";
import { sendGa4PurchaseEvent } from "@/lib/conversions/ga4-mp";
import { sendMetaPurchaseEvent } from "@/lib/conversions/meta-capi";

function siteUrl() {
  return (
    process.env.AUTH_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://esitef.com"
  ).replace(/\/$/, "");
}

function parseAttribution(metadata: unknown): CheckoutAttribution | null {
  if (!metadata || typeof metadata !== "object") return null;
  const attr = (metadata as { attribution?: CheckoutAttribution }).attribution;
  return attr && typeof attr === "object" ? attr : null;
}

export async function trackPurchase(orderId: string) {
  try {
    const db = getDb();
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);
    if (!order || order.status !== "paid") return;

    const meta = (order.metadata as Record<string, unknown>) ?? {};
    if (meta.trackingPurchaseSent) return;

    const [item] = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId))
      .limit(1);

    let email: string | null = null;
    let phone: string | null = null;
    if (order.userId) {
      const [user] = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, order.userId))
        .limit(1);
      email = user?.email ?? null;
    }
    if (typeof meta.customerEmail === "string") email = meta.customerEmail;
    if (typeof meta.phone === "string") phone = meta.phone;
    if (typeof meta.customerPhone === "string") phone = meta.customerPhone;

    const value = order.totalCents / 100;
    const currency = order.currency;
    const attribution = parseAttribution(order.metadata);
    const eventSourceUrl = `${siteUrl()}/gracias`;

    await Promise.all([
      sendMetaPurchaseEvent({
        eventId: orderId,
        eventSourceUrl,
        value,
        currency,
        email,
        phone,
        attribution,
        contentName: item?.title,
      }),
      sendGa4PurchaseEvent({
        eventId: orderId,
        value,
        currency,
        itemId: item?.courseId ?? orderId,
        itemName: item?.title,
        attribution,
      }),
    ]);

    await db
      .update(orders)
      .set({
        metadata: {
          ...meta,
          trackingPurchaseSent: true,
          trackingPurchaseSentAt: new Date().toISOString(),
        },
      })
      .where(eq(orders.id, orderId));
  } catch (err) {
    console.error("[trackPurchase]", orderId, err);
  }
}
