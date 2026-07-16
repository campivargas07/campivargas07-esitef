import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { orderItems, orders } from "@esitef/db";
import { getDb } from "@/lib/db";
import {
  getPresencialCheckoutConfig,
  toStripeAmount,
} from "@/lib/presencial-checkout";
import { getPresencialBySlug } from "@/lib/presenciales";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { instanceSlug, planKey } = (await req.json()) as {
    instanceSlug?: string;
    planKey?: string;
  };

  if (!instanceSlug || !planKey) {
    return NextResponse.json(
      { error: "instanceSlug and planKey required" },
      { status: 400 }
    );
  }

  const formacion = getPresencialBySlug(instanceSlug);
  const config = getPresencialCheckoutConfig(instanceSlug);
  const plan = config?.plans[planKey];

  if (!formacion || !config?.checkout_enabled || !plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const currency = config.currency.toUpperCase();
  const totalCents = toStripeAmount(plan.price, currency);
  const courseTitle = [formacion.title, formacion.title_bold]
    .filter(Boolean)
    .join(" ");

  const isSubscription = Boolean(plan.subscription);
  const installments = isSubscription ? 3 : 1;

  const db = getDb();
  const [order] = await db
    .insert(orders)
    .values({
      userId: session.user.id,
      status: "pending",
      currency,
      subtotalCents: totalCents * installments,
      totalCents: totalCents * installments,
      provider: "stripe",
      metadata: {
        type: "presencial",
        instanceSlug,
        planKey,
        subscription: isSubscription,
        installments,
        installmentAmountCents: totalCents,
      },
    })
    .returning();

  await db.insert(orderItems).values({
    orderId: order.id,
    title: `${courseTitle} — ${plan.name}`,
    unitPriceCents: totalCents,
  });

  const stripe = getStripe();
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: isSubscription ? "subscription" : "payment",
    ...(isSubscription ? {} : { payment_method_types: ["card", "paypal"] }),
    customer_email: session.user.email ?? undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: totalCents,
          ...(isSubscription
            ? { recurring: { interval: "month" as const, interval_count: 1 } }
            : {}),
          product_data: {
            name: courseTitle,
            description: `${plan.name}${plan.period ? ` · ${plan.period}` : ""}`,
          },
        },
      },
    ],
    success_url: `${process.env.AUTH_URL}/gracias?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.AUTH_URL}/${instanceSlug}#inscribirme`,
    metadata: {
      orderId: order.id,
      type: "presencial",
      instanceSlug,
      planKey,
    },
    ...(isSubscription
      ? {
          subscription_data: {
            metadata: {
              orderId: order.id,
              installments: String(installments),
              type: "presencial",
              instanceSlug,
              planKey,
            },
          },
        }
      : {}),
    automatic_tax: { enabled: Boolean(process.env.STRIPE_TAX_ENABLED) },
  });

  await db
    .update(orders)
    .set({ providerOrderId: checkoutSession.id })
    .where(eq(orders.id, order.id));

  return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("[checkout/presencial]", err);
    const message =
      err instanceof Error ? err.message : "No se pudo iniciar el pago.";
    return NextResponse.json({ error: message, message }, { status: 500 });
  }
}
