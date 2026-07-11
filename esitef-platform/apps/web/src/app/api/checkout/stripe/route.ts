import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { courses, orders, orderItems } from "@esitef/db";
import { getDb } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseSlug } = (await req.json()) as { courseSlug?: string };
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

  const [order] = await db
    .insert(orders)
    .values({
      userId: session.user.id,
      status: "pending",
      currency: course.currency,
      subtotalCents: course.priceCents,
      totalCents: course.priceCents,
      provider: "stripe",
      metadata: { courseSlug },
    })
    .returning();

  await db.insert(orderItems).values({
    orderId: order.id,
    courseId: course.id,
    title: course.title,
    unitPriceCents: course.priceCents,
  });

  const stripe = getStripe();
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: session.user.email ?? undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: course.currency.toLowerCase(),
          unit_amount: course.priceCents,
          product_data: {
            name: course.title,
            description: course.excerpt ?? undefined,
          },
        },
      },
    ],
    success_url: `${process.env.AUTH_URL}/gracias?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.AUTH_URL}/cursos/${course.slug}`,
    metadata: { orderId: order.id, courseId: course.id },
    automatic_tax: { enabled: Boolean(process.env.STRIPE_TAX_ENABLED) },
  });

  await db
    .update(orders)
    .set({ providerOrderId: checkoutSession.id })
    .where(eq(orders.id, order.id));

  return NextResponse.json({ url: checkoutSession.url });
}
