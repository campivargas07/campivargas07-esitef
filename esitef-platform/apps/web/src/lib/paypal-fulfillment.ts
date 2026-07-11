import { and, eq } from "drizzle-orm";
import { orders } from "@esitef/db";
import { getDb } from "@/lib/db";
import { grantEnrollmentFromOrder } from "@/lib/lms";
import { capturePayPalOrder } from "@/lib/paypal";

export async function fulfillPaidOrder(orderId: string, providerOrderId?: string) {
  const db = getDb();
  const [existing] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!existing) return false;

  if (existing.status !== "paid") {
    await db
      .update(orders)
      .set({
        status: "paid",
        paidAt: new Date(),
        ...(providerOrderId ? { providerOrderId } : {}),
      })
      .where(eq(orders.id, orderId));
  }

  await grantEnrollmentFromOrder(orderId);
  return true;
}

export async function confirmPayPalCheckoutByToken(paypalOrderId: string) {
  const db = getDb();
  const [existing] = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.provider, "paypal"),
        eq(orders.providerOrderId, paypalOrderId)
      )
    )
    .limit(1);

  if (!existing) return false;
  if (existing.status === "paid") {
    await grantEnrollmentFromOrder(existing.id);
    return true;
  }

  const capture = await capturePayPalOrder(paypalOrderId);
  if (capture.status !== "COMPLETED") return false;

  const captureId =
    capture.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? paypalOrderId;

  await db
    .update(orders)
    .set({
      status: "paid",
      paidAt: new Date(),
      providerOrderId: captureId,
    })
    .where(eq(orders.id, existing.id));

  await grantEnrollmentFromOrder(existing.id);
  return true;
}
