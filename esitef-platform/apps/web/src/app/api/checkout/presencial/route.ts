import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { orderItems, orders } from "@esitef/db";
import { getDb } from "@/lib/db";
import {
  getPresencialCheckoutConfig,
  getPresencialInstallments,
  toStripeAmount,
} from "@/lib/presencial-checkout";
import {
  getPresencialBySlug,
  formatPresencialOrderLabel,
  formatPresencialCourseTitle,
  formatPresencialSede,
} from "@/lib/presenciales";
import {
  createPayPalCheckoutOrder,
  isPayPalConfigured,
} from "@/lib/paypal";
import { getStripe } from "@/lib/stripe";
import { mergeAttributionMetadata } from "@/lib/attribution-server";
import { parseAttributionFromBody } from "@/lib/attribution-request";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      instanceSlug?: string;
      planKey?: string;
      attribution?: unknown;
    };
    const attribution = parseAttributionFromBody(body);
    const instanceSlug = body.instanceSlug;
    const planKey = body.planKey;

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

    const isArgentina = formacion.pais === "argentina";
    const isSubscription = Boolean(plan.subscription);

    // Argentina: no Stripe, no plan de 3 cuotas.
    if (isArgentina && (isSubscription || planKey === "3-cuotas")) {
      return NextResponse.json(
        {
          error:
            "El plan de 3 pagos no está disponible en Argentina. Elige reserva o pago completo.",
        },
        { status: 400 }
      );
    }

    const currency = config.currency.toUpperCase();
    const totalCents = toStripeAmount(plan.price, currency);
    const orderLabel = formatPresencialOrderLabel({
      formacion,
      planName: plan.name,
      instanceSlug,
      maxLength: 127,
    });
    const courseTitle = formatPresencialCourseTitle(formacion);
    const sedeLabel = formatPresencialSede(formacion.sede);
    const installments = getPresencialInstallments(plan);
    const baseUrl = (process.env.AUTH_URL ?? "http://localhost:3000").replace(
      /\/$/,
      ""
    );

    const db = getDb();

    // Reserva / completo → PayPal (redirect), except Argentina (transfer).
    if (!isSubscription) {
      if (isArgentina) {
        return NextResponse.json(
          {
            error:
              "En Argentina la inscripción es por transferencia bancaria. Vuelve a la página de inscripción.",
          },
          { status: 400 }
        );
      }

      if (!isPayPalConfigured()) {
        return NextResponse.json(
          { error: "PayPal no está configurado en el servidor." },
          { status: 503 }
        );
      }

      const [order] = await db
        .insert(orders)
        .values({
          userId: session.user.id,
          status: "pending",
          currency,
          subtotalCents: totalCents,
          totalCents,
          provider: "paypal",
          metadata: mergeAttributionMetadata(
            {
              type: "presencial",
              instanceSlug,
              planKey,
              subscription: false,
              installments: 1,
              installmentAmountCents: totalCents,
              pais: formacion.pais ?? null,
              sede: formacion.sede ?? null,
            },
            attribution
          ),
        })
        .returning();

      await db.insert(orderItems).values({
        orderId: order.id,
        title: orderLabel,
        unitPriceCents: totalCents,
      });

      const paypal = await createPayPalCheckoutOrder({
        orderId: order.id,
        amountCents: totalCents,
        currency,
        title: orderLabel,
        returnUrl: `${baseUrl}/gracias?provider=paypal`,
        cancelUrl: `${baseUrl}/${instanceSlug}#inscribirme`,
      });

      await db
        .update(orders)
        .set({ providerOrderId: paypal.paypalOrderId })
        .where(eq(orders.id, order.id));

      return NextResponse.json({
        url: paypal.url,
        provider: "paypal",
        orderId: order.id,
      });
    }

    // 3 cuotas → Stripe Billing (fuera de Argentina).
    const [order] = await db
      .insert(orders)
      .values({
        userId: session.user.id,
        status: "pending",
        currency,
        subtotalCents: totalCents * installments,
        totalCents: totalCents * installments,
        provider: "stripe",
        metadata: mergeAttributionMetadata(
          {
            type: "presencial",
            instanceSlug,
            planKey,
            subscription: true,
            installments,
            installmentAmountCents: totalCents,
            pais: formacion.pais ?? null,
            sede: formacion.sede ?? null,
          },
          attribution
        ),
      })
      .returning();

    await db.insert(orderItems).values({
      orderId: order.id,
      title: orderLabel,
      unitPriceCents: totalCents,
    });

    const stripe = getStripe();
    const stripeProductName = sedeLabel
      ? `${courseTitle} · ${sedeLabel}`
      : courseTitle;
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: session.user.email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: totalCents,
            recurring: { interval: "month" as const, interval_count: 1 },
            product_data: {
              name: stripeProductName,
              description: `${plan.name}${plan.period ? ` · ${plan.period}` : ""}`,
            },
          },
        },
      ],
      success_url: `${baseUrl}/gracias?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/${instanceSlug}#inscribirme`,
      metadata: {
        orderId: order.id,
        type: "presencial",
        instanceSlug,
        planKey,
      },
      subscription_data: {
        metadata: {
          orderId: order.id,
          installments: String(installments),
          type: "presencial",
          instanceSlug,
          planKey,
        },
      },
      automatic_tax: { enabled: Boolean(process.env.STRIPE_TAX_ENABLED) },
    });

    await db
      .update(orders)
      .set({ providerOrderId: checkoutSession.id })
      .where(eq(orders.id, order.id));

    return NextResponse.json({
      url: checkoutSession.url,
      provider: "stripe",
    });
  } catch (err) {
    console.error("[checkout/presencial]", err);
    const message =
      err instanceof Error ? err.message : "No se pudo iniciar el pago.";
    return NextResponse.json({ error: message, message }, { status: 500 });
  }
}
