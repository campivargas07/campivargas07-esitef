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
} from "@/lib/online-currency";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const [order] = await db
    .insert(orders)
    .values({
      userId: session.user.id,
      status: "pending",
      currency: priced.currency,
      subtotalCents: priced.amountMinor,
      totalCents: priced.amountMinor,
      provider: "stripe",
      metadata: {
        courseSlug,
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

  const stripe = getStripe();
  const productDescription = course.excerpt?.trim();
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: session.user.email ?? undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: priced.currency.toLowerCase(),
          unit_amount: priced.amountMinor,
          product_data: {
            name: course.title,
            ...(productDescription ? { description: productDescription } : {}),
          },
        },
      },
    ],
    success_url: `${process.env.AUTH_URL}/gracias?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.AUTH_URL}/cursos/${course.slug}`,
    metadata: {
      orderId: order.id,
      courseId: course.id,
      currency: priced.currency,
    },
    automatic_tax: { enabled: Boolean(process.env.STRIPE_TAX_ENABLED) },
  });

  await db
    .update(orders)
    .set({ providerOrderId: checkoutSession.id })
    .where(eq(orders.id, order.id));

  return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("[checkout/stripe]", err);
    const message =
      err instanceof Error ? err.message : "No se pudo iniciar el pago.";
    return NextResponse.json({ error: message, message }, { status: 500 });
  }
}
