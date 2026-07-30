import { eq } from "drizzle-orm";
import { orderItems, orders, users } from "@esitef/db";
import { getDb } from "@/lib/db";
import {
  getPresencialCheckoutConfig,
  presencialUsesBankTransfer,
  toStripeAmount,
} from "@/lib/presencial-checkout";
import {
  getPresencialBySlug,
  isPresencialHybrid,
  formatPresencialOrderLabel,
} from "@/lib/presenciales";
import { createPayPalSdkOrder } from "@/lib/paypal";
import { mergeAttributionMetadata } from "@/lib/attribution-server";
import type { CheckoutAttribution } from "@/lib/attribution";
import {
  normalizeGuestEmail,
  normalizeGuestName,
} from "@/lib/paypal-guest-identity";

export async function createPayPalPresencialOrder(params: {
  userId?: string | null;
  guestEmail?: string | null;
  guestName?: string | null;
  instanceSlug: string;
  planKey: string;
  attribution?: CheckoutAttribution | null;
}) {
  const formacion = getPresencialBySlug(params.instanceSlug);
  const config = getPresencialCheckoutConfig(params.instanceSlug);
  const plan = config?.plans[params.planKey];

  if (!formacion || !config?.checkout_enabled || !plan) {
    return { error: "Plan not found" as const, status: 404 as const };
  }

  if (presencialUsesBankTransfer(formacion.pais)) {
    return {
      error: "En Argentina la inscripción es por transferencia bancaria." as const,
      status: 400 as const,
    };
  }

  if (plan.subscription) {
    return {
      error: "Este plan usa Stripe. Vuelve a la página de inscripción." as const,
      status: 400 as const,
    };
  }

  const guest = !params.userId;
  if (guest && isPresencialHybrid(formacion)) {
    return {
      error: "Debes iniciar sesión para inscribirte en esta formación." as const,
      status: 401 as const,
    };
  }

  const guestEmail = guest ? normalizeGuestEmail(params.guestEmail) : null;
  const guestName = guest ? normalizeGuestName(params.guestName) : null;
  if (guest && !guestName) {
    return {
      error: "Introduce tu nombre completo." as const,
      status: 400 as const,
    };
  }
  if (guest && params.guestEmail && !guestEmail) {
    return {
      error: "Introduce un email válido." as const,
      status: 400 as const,
    };
  }
  if (guest && !guestEmail) {
    return {
      error: "Introduce un email válido." as const,
      status: 400 as const,
    };
  }

  const db = getDb();
  let buyerName: string | null = null;
  let buyerEmail: string | null = null;
  if (params.userId) {
    const [buyer] = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, params.userId))
      .limit(1);
    buyerName = buyer?.name?.trim() ?? null;
    buyerEmail = buyer?.email?.trim().toLowerCase() ?? null;
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
  const orderLabel = formatPresencialOrderLabel({
    formacion,
    planName: plan.name,
    instanceSlug: params.instanceSlug,
    maxLength: 127,
  });
  const baseUrl = (process.env.AUTH_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  );

  const [order] = await db
    .insert(orders)
    .values({
      userId: params.userId ?? null,
      status: "pending",
      currency,
      subtotalCents: totalCents,
      totalCents,
      provider: "paypal",
      metadata: mergeAttributionMetadata(
        {
          type: "presencial",
          instanceSlug: params.instanceSlug,
          planKey: params.planKey,
          subscription: false,
          installments: 1,
          installmentAmountCents: totalCents,
          pais: formacion.pais ?? null,
          sede: formacion.sede ?? null,
          checkout: "checkout-page",
          guest,
          ...(guestEmail ? { guestEmail } : {}),
          ...(guestName ? { guestName } : {}),
          ...(buyerName ? { buyerName } : {}),
          ...(buyerEmail ? { buyerEmail } : {}),
        },
        params.attribution
      ),
    })
    .returning();

  await db.insert(orderItems).values({
    orderId: order.id,
    title: orderLabel,
    unitPriceCents: totalCents,
  });

  const paypalOrder = await createPayPalSdkOrder({
    orderId: order.id,
    amountCents: totalCents,
    currency,
    title: orderLabel,
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
    courseTitle: orderLabel,
    instanceSlug: params.instanceSlug,
    planKey: params.planKey,
  };
}
