import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { courses, orders, orderItems } from "@esitef/db";
import { getDb } from "@/lib/db";
import {
  ONLINE_CURRENCY_COOKIE,
  normalizeOnlineCurrency,
  resolveOnlinePrice,
  usesDirectPayPal,
} from "@/lib/online-currency";
import { createPayPalCheckoutOrder, isPayPalConfigured } from "@/lib/paypal";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isPayPalConfigured()) {
      return NextResponse.json(
        { error: "PayPal no está configurado en el servidor." },
        { status: 503 }
      );
    }

    const body = (await req.json()) as { courseSlug?: string; currency?: string };
    const courseSlug = body.courseSlug;
    if (!courseSlug) {
      return NextResponse.json({ error: "courseSlug required" }, { status: 400 });
    }

    const db = getDb();
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.slug, courseSlug))
      .limit(1);

    if (!course || !course.published) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const cookieStore = await cookies();
    const preferred = normalizeOnlineCurrency(
      body.currency ?? cookieStore.get(ONLINE_CURRENCY_COOKIE)?.value
    );
    const priced = resolveOnlinePrice({
      courseSlug: course.slug,
      preferred,
      fallbackCents: course.priceCents,
      fallbackCurrency: course.currency,
    });

    if (priced.amountMinor <= 0) {
      return NextResponse.json(
        { error: "Este curso no requiere pago online." },
        { status: 400 }
      );
    }

    if (!usesDirectPayPal(priced.currency)) {
      return NextResponse.json(
        {
          error:
            "Para esta moneda usa el checkout con tarjeta (PayPal disponible en Stripe).",
        },
        { status: 400 }
      );
    }

    const [order] = await db
      .insert(orders)
      .values({
        userId: session.user.id,
        status: "pending",
        currency: priced.currency,
        subtotalCents: priced.amountMinor,
        totalCents: priced.amountMinor,
        provider: "paypal",
        metadata: {
          courseSlug,
          courseId: course.id,
          preferredCurrency: preferred,
          priceSource: priced.source,
        },
      })
      .returning();

    await db.insert(orderItems).values({
      orderId: order.id,
      courseId: course.id,
      title: course.title,
      unitPriceCents: priced.amountMinor,
    });

    const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
    const paypalOrder = await createPayPalCheckoutOrder({
      orderId: order.id,
      amountCents: priced.amountMinor,
      currency: priced.currency,
      title: course.title,
      returnUrl: `${baseUrl}/gracias?provider=paypal`,
      cancelUrl: `${baseUrl}/cursos/${course.slug}`,
    });

    await db
      .update(orders)
      .set({ providerOrderId: paypalOrder.paypalOrderId })
      .where(eq(orders.id, order.id));

    return NextResponse.json({ url: paypalOrder.url });
  } catch (err) {
    console.error("[checkout/paypal]", err);
    const message =
      err instanceof Error ? err.message : "No se pudo iniciar el pago.";
    return NextResponse.json({ error: message, message }, { status: 500 });
  }
}
