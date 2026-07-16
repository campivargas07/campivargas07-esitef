import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { courses, orderItems, orders } from "@esitef/db";
import { getDb } from "@/lib/db";
import {
  ONLINE_CURRENCY_COOKIE,
  normalizeOnlineCurrency,
  resolveOnlinePrice,
  usesPayPalEmbedded,
  type OnlineCurrency,
} from "@/lib/online-currency";
import { createPayPalSdkOrder } from "@/lib/paypal";

export async function createPayPalCourseOrder(params: {
  userId: string;
  courseSlug: string;
  currency?: string;
}) {
  const db = getDb();
  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.slug, params.courseSlug))
    .limit(1);

  if (!course || !course.published) {
    return { error: "Course not found" as const, status: 404 as const };
  }

  const cookieStore = await cookies();
  const preferred = normalizeOnlineCurrency(
    params.currency ?? cookieStore.get(ONLINE_CURRENCY_COOKIE)?.value
  );
  const priced = resolveOnlinePrice({
    courseSlug: course.slug,
    preferred,
    fallbackCents: course.priceCents,
    fallbackCurrency: course.currency,
  });

  if (priced.amountMinor <= 0) {
    return {
      error: "Este curso no requiere pago online." as const,
      status: 400 as const,
    };
  }

  if (!usesPayPalEmbedded(priced.currency)) {
    return {
      error: "Esta moneda no usa checkout PayPal embebido." as const,
      status: 400 as const,
    };
  }

  const [order] = await db
    .insert(orders)
    .values({
      userId: params.userId,
      status: "pending",
      currency: priced.currency,
      subtotalCents: priced.amountMinor,
      totalCents: priced.amountMinor,
      provider: "paypal",
      metadata: {
        courseSlug: course.slug,
        courseId: course.id,
        preferredCurrency: preferred,
        priceSource: priced.source,
        checkout: "embedded",
      },
    })
    .returning();

  await db.insert(orderItems).values({
    orderId: order.id,
    courseId: course.id,
    title: course.title,
    unitPriceCents: priced.amountMinor,
  });

  const paypalOrder = await createPayPalSdkOrder({
    orderId: order.id,
    amountCents: priced.amountMinor,
    currency: priced.currency,
    title: course.title,
  });

  await db
    .update(orders)
    .set({ providerOrderId: paypalOrder.paypalOrderId })
    .where(eq(orders.id, order.id));

  return {
    orderId: order.id,
    paypalOrderId: paypalOrder.paypalOrderId,
    currency: priced.currency as OnlineCurrency,
    amountMinor: priced.amountMinor,
    courseTitle: course.title,
    courseSlug: course.slug,
  };
}
