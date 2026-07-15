import { eq } from "drizzle-orm";
import { orders } from "@esitef/db";
import { getDb } from "@/lib/db";
import { isGoogleCalendarConfigured } from "@/lib/google-calendar";
import { confirmSesionOnlineBooking } from "@/lib/sesiones-online-bookings";

const SIM_PREFIX = "sim_";

/** Dev/demo: calendario demo + checkout sin Stripe. Prod: solo con SESIONES_ONLINE_SIMULATION=true */
export function isSesionesOnlineSimulation(): boolean {
  const flag = process.env.SESIONES_ONLINE_SIMULATION?.trim().toLowerCase();
  if (flag === "true" || flag === "1") return true;
  if (flag === "false" || flag === "0") return false;
  return process.env.NODE_ENV === "development" && !isGoogleCalendarConfigured();
}

export function buildSimCheckoutUrl(orderId: string, baseUrl: string): string {
  return `${baseUrl}/sesiones-online/confirmacion?session_id=${SIM_PREFIX}${orderId}`;
}

export function parseSimSessionId(sessionId: string): string | null {
  if (!sessionId.startsWith(SIM_PREFIX)) return null;
  const orderId = sessionId.slice(SIM_PREFIX.length);
  return orderId.length > 0 ? orderId : null;
}

export async function fulfillSimSesionOnlineOrder(
  orderId: string,
): Promise<boolean> {
  const db = getDb();
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order || order.metadata?.type !== "sesiones-online") return false;
  if (order.status === "paid") {
    await confirmSesionOnlineBooking(orderId);
    return true;
  }

  await db
    .update(orders)
    .set({
      status: "paid",
      paidAt: new Date(),
      providerOrderId: `${SIM_PREFIX}${orderId}`,
    })
    .where(eq(orders.id, orderId));

  await confirmSesionOnlineBooking(orderId);
  return true;
}
