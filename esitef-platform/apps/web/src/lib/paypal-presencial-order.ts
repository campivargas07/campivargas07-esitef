import { eq } from "drizzle-orm";
import { orderItems, orders } from "@esitef/db";
import { getDb } from "@/lib/db";
import {
  getPresencialCheckoutConfig,
  toStripeAmount,
} from "@/lib/presencial-checkout";
import { getPresencialBySlug } from "@/lib/presenciales";
import { createPayPalSdkOrder } from "@/lib/paypal";

export async function createPayPalPresencialOrder(params: {
  userId: string;
  instanceSlug: string;
  planKey: string;
}) {
  const formacion = getPresencialBySlug(params.instanceSlug);
  const config = getPresencialCheckoutConfig(params.instanceSlug);
  const plan = config?.plans[params.planKey];

  if (!formacion || !config?.checkout_enabled || !plan) {
    return { error: "Plan not found" as const, status: 404 as const };
  }

  if (plan.subscription) {
    return {
      error: "Este plan usa Stripe. Vuelve a la página de inscripción." as const,
      status: 400 as const,
    };
  }

  const isArgentina = formacion.pais === "argentina";
  if (isArgentina && params.planKey === "3-cuotas") {
    return {
      error: "El plan de 3 pagos no está disponible en Argentina." as const,
      status: 400 as const,
    };
  }

  const currency = config.currency.toUpperCase();
  const totalCents = toStripeAmount(plan.price, currency);
  const courseTitle = [formacion.title, formacion.title_bold]
    .filter(Boolean)
    .join(" ");
  const baseUrl = (process.env.AUTH_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  );

  const db = getDb();
  const [order] = await db
    .insert(orders)
    .values({
      userId: params.userId,
      status: "pending",
      currency,
      subtotalCents: totalCents,
      totalCents,
      provider: "paypal",
      metadata: {
        type: "presencial",
        instanceSlug: params.instanceSlug,
        planKey: params.planKey,
        subscription: false,
        installments: 1,
        installmentAmountCents: totalCents,
        pais: formacion.pais ?? null,
        checkout: "checkout-page",
      },
    })
    .returning();

  await db.insert(orderItems).values({
    orderId: order.id,
    title: `${courseTitle} — ${plan.name}`,
    unitPriceCents: totalCents,
  });

  const paypalOrder = await createPayPalSdkOrder({
    orderId: order.id,
    amountCents: totalCents,
    currency,
    title: `${courseTitle} — ${plan.name}`.slice(0, 127),
    returnUrl: `${baseUrl}/gracias?provider=paypal`,
    cancelUrl: `${baseUrl}/${params.instanceSlug}/pagar?plan=${params.planKey}`,
  });

  await db
    .update(orders)
    .set({ providerOrderId: paypalOrder.paypalOrderId })
    .where(eq(orders.id, order.id));

  return {
    orderId: order.id,
    paypalOrderId: paypalOrder.paypalOrderId,
    currency,
    amountMinor: totalCents,
    courseTitle: `${courseTitle} — ${plan.name}`,
    instanceSlug: params.instanceSlug,
    planKey: params.planKey,
  };
}
