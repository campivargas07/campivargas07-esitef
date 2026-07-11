import { and, eq } from "drizzle-orm";
import {
  courses,
  enrollments,
  lessons,
  modules,
  orders,
  orderItems,
  webhookEvents,
} from "@esitef/db";
import { getDb } from "@/lib/db";

export async function grantEnrollmentFromOrder(orderId: string) {
  const db = getDb();
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order || order.status !== "paid" || !order.userId) return;

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  for (const item of items) {
    if (!item.courseId) continue;
    await db
      .insert(enrollments)
      .values({
        userId: order.userId,
        courseId: item.courseId,
        status: "active",
      })
      .onConflictDoNothing();
  }
}

export async function isWebhookProcessed(
  provider: "stripe" | "paypal",
  externalEventId: string
) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(webhookEvents)
    .where(
      and(
        eq(webhookEvents.provider, provider),
        eq(webhookEvents.externalEventId, externalEventId)
      )
    )
    .limit(1);
  return Boolean(row);
}

export async function markWebhookProcessed(
  provider: "stripe" | "paypal",
  externalEventId: string,
  eventType: string,
  payload: unknown
) {
  const db = getDb();
  await db.insert(webhookEvents).values({
    provider,
    externalEventId,
    eventType,
    payload: payload as Record<string, unknown>,
  });
}

export async function getCourseBySlug(slug: string) {
  const db = getDb();
  const [course] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.slug, slug), eq(courses.published, true)))
    .limit(1);
  return course ?? null;
}

export async function getPublishedCourses() {
  const db = getDb();
  return db.select().from(courses).where(eq(courses.published, true));
}

export async function getCourseCurriculum(courseId: string) {
  const db = getDb();
  const mods = await db
    .select()
    .from(modules)
    .where(eq(modules.courseId, courseId))
    .orderBy(modules.sortOrder);

  const result = [];
  for (const mod of mods) {
    const modLessons = await db
      .select()
      .from(lessons)
      .where(eq(lessons.moduleId, mod.id))
      .orderBy(lessons.sortOrder);
    result.push({ ...mod, lessons: modLessons });
  }
  return result;
}

export async function userHasEnrollment(userId: string, courseId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(enrollments)
    .where(
      and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, courseId),
        eq(enrollments.status, "active")
      )
    )
    .limit(1);
  return Boolean(row);
}

export async function issueCertificate(userId: string, courseId: string) {
  const db = getDb();
  const code = `ESITEF-${courseId.slice(0, 8).toUpperCase()}-${userId.slice(0, 8).toUpperCase()}`;
  const { certificates } = await import("@esitef/db");
  await db
    .insert(certificates)
    .values({ userId, courseId, certificateCode: code })
    .onConflictDoNothing();
  return code;
}
