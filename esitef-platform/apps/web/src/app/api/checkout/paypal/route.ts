import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { courses, orders, orderItems } from "@esitef/db";
import { getDb } from "@/lib/db";

/**
 * PayPal checkout placeholder — creates pending order; production uses PayPal Orders API + webhook.
 */
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

  if (!course) {
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
      provider: "paypal",
      metadata: { courseSlug, mode: "sandbox" },
    })
    .returning();

  await db.insert(orderItems).values({
    orderId: order.id,
    courseId: course.id,
    title: course.title,
    unitPriceCents: course.priceCents,
  });

  const clientId = process.env.PAYPAL_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({
      orderId: order.id,
      message: "PayPal not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.",
    });
  }

  const approveUrl = `https://www.sandbox.paypal.com/checkoutnow?token=PAYPAL_ORDER_${order.id}`;
  return NextResponse.json({ orderId: order.id, url: approveUrl });
}
