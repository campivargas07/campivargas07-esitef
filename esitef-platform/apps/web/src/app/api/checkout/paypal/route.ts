import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { courses, orders, orderItems } from "@esitef/db";
import { getDb } from "@/lib/db";
import { createPayPalCheckoutOrder } from "@/lib/paypal";

export async function POST(req: Request) {
  try {
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

    if (course.priceCents <= 0) {
      return NextResponse.json(
        { error: "Este curso no requiere pago online." },
        { status: 400 }
      );
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
        metadata: { courseSlug, courseId: course.id },
      })
      .returning();

    await db.insert(orderItems).values({
      orderId: order.id,
      courseId: course.id,
      title: course.title,
      unitPriceCents: course.priceCents,
    });

    const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
    const paypalOrder = await createPayPalCheckoutOrder({
      orderId: order.id,
      amountCents: course.priceCents,
      currency: course.currency,
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
