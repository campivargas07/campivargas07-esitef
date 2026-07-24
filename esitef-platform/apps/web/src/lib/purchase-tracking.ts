import { and, eq } from "drizzle-orm";
import { orderItems, orders } from "@esitef/db";
import { getDb } from "@/lib/db";

export type PurchaseTrackingContext = {
  transactionId: string;
  value: number;
  currency: string;
  itemId: string;
  itemName: string;
};

export async function getPurchaseContextByStripeSession(
  sessionId: string
): Promise<PurchaseTrackingContext | null> {
  const db = getDb();
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.providerOrderId, sessionId))
    .limit(1);
  if (!order) return null;
  return buildContext(order.id, order.totalCents, order.currency);
}

export async function getPurchaseContextByPayPalToken(
  token: string
): Promise<PurchaseTrackingContext | null> {
  const db = getDb();
  let [order] = await db
    .select()
    .from(orders)
    .where(
      and(eq(orders.provider, "paypal"), eq(orders.providerOrderId, token))
    )
    .limit(1);

  if (!order) {
    [order] = await db.select().from(orders).where(eq(orders.id, token)).limit(1);
  }

  if (!order) return null;
  return buildContext(order.id, order.totalCents, order.currency);
}

async function buildContext(
  orderId: string,
  totalCents: number,
  currency: string
): Promise<PurchaseTrackingContext | null> {
  const db = getDb();
  const [item] = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))
    .limit(1);

  return {
    transactionId: orderId,
    value: totalCents / 100,
    currency,
    itemId: item?.courseId ?? orderId,
    itemName: item?.title ?? "ESITEF",
  };
}
