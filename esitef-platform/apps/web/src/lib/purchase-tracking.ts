import { and, eq, sql } from "drizzle-orm";
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

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

  // After capture, providerOrderId may be the capture id; order id stays in metadata.
  if (!order) {
    [order] = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.provider, "paypal"),
          sql`${orders.metadata}->>'paypalOrderId' = ${token}`
        )
      )
      .limit(1);
  }

  // Legacy: some flows used the internal UUID as the thank-you token.
  if (!order && UUID_RE.test(token)) {
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
