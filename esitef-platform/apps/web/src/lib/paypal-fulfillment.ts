import { and, eq, sql } from "drizzle-orm";
import { orders } from "@esitef/db";
import { getDb } from "@/lib/db";
import { grantEnrollmentFromOrder } from "@/lib/lms";
import { capturePayPalOrder } from "@/lib/paypal";
import { sendPresencialInscriptionConfirmation } from "@/lib/presencial-confirmation";

export type FulfillResult = {
  confirmed: boolean;
  isPresencial: boolean;
};

function isPresencialMeta(metadata: unknown): boolean {
  return (metadata as { type?: string } | null)?.type === "presencial";
}

async function afterPaid(orderId: string, metadata: unknown) {
  if (isPresencialMeta(metadata)) {
    await sendPresencialInscriptionConfirmation(orderId);
    return;
  }
  await grantEnrollmentFromOrder(orderId);
}

export async function fulfillPaidOrder(
  orderId: string,
  providerOrderId?: string
): Promise<boolean> {
  const db = getDb();
  const [existing] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!existing) return false;

  if (existing.status !== "paid") {
    const prevMeta = (existing.metadata as Record<string, unknown>) ?? {};
    await db
      .update(orders)
      .set({
        status: "paid",
        paidAt: new Date(),
        ...(providerOrderId ? { providerOrderId } : {}),
        metadata: {
          ...prevMeta,
          ...(existing.provider === "paypal" && existing.providerOrderId
            ? { paypalOrderId: existing.providerOrderId }
            : {}),
        },
      })
      .where(eq(orders.id, orderId));
  }

  await afterPaid(orderId, existing.metadata);
  return true;
}

export async function confirmPayPalCheckoutByToken(
  paypalOrderId: string
): Promise<FulfillResult> {
  const db = getDb();

  let [order] = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.provider, "paypal"),
        eq(orders.providerOrderId, paypalOrderId)
      )
    )
    .limit(1);

  if (!order) {
    [order] = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.provider, "paypal"),
          sql`${orders.metadata}->>'paypalOrderId' = ${paypalOrderId}`
        )
      )
      .limit(1);
  }

  if (!order) return { confirmed: false, isPresencial: false };
  const presencial = isPresencialMeta(order.metadata);

  if (order.status === "paid") {
    await afterPaid(order.id, order.metadata);
    return { confirmed: true, isPresencial: presencial };
  }

  const capture = await capturePayPalOrder(paypalOrderId);
  if (capture.status !== "COMPLETED") {
    return { confirmed: false, isPresencial: presencial };
  }

  const captureId =
    capture.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? paypalOrderId;

  await db
    .update(orders)
    .set({
      status: "paid",
      paidAt: new Date(),
      providerOrderId: captureId,
      metadata: {
        ...((order.metadata as Record<string, unknown>) ?? {}),
        paypalOrderId,
      },
    })
    .where(eq(orders.id, order.id));

  await afterPaid(order.id, order.metadata);
  return { confirmed: true, isPresencial: presencial };
}
