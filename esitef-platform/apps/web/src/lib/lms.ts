import { and, count, eq, inArray, ne } from "drizzle-orm";
import {
  courses,
  enrollments,
  lessonProgress,
  lessons,
  modules,
  orders,
  orderItems,
  webhookEvents,
} from "@esitef/db";
import { getDb } from "@/lib/db";

export function sanitizeThumbnail(url: string | null | undefined) {
  if (!url || url === "NULL") return null;
  return url;
}

function normalizeCourse<T extends { thumbnailUrl: string | null }>(course: T) {
  return { ...course, thumbnailUrl: sanitizeThumbnail(course.thumbnailUrl) };
}

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
  return course ? normalizeCourse(course) : null;
}

export async function getPublishedCourses() {
  const db = getDb();
  const rows = await db.select().from(courses).where(eq(courses.published, true));
  return rows.map(normalizeCourse);
}

export async function getEnrollmentCount(courseId: string) {
  const db = getDb();
  const [row] = await db
    .select({ c: count() })
    .from(enrollments)
    .where(
      and(eq(enrollments.courseId, courseId), eq(enrollments.status, "active"))
    );
  return row?.c ?? 0;
}

export async function getRelatedCourses(courseId: string, limit = 3) {
  const db = getDb();
  return db
    .select()
    .from(courses)
    .where(and(eq(courses.published, true), ne(courses.id, courseId)))
    .limit(limit)
    .then((rows) => rows.map(normalizeCourse));
}

export function formatCourseDuration(
  curriculum: Awaited<ReturnType<typeof getCourseCurriculum>>
) {
  let totalSeconds = 0;
  let lessonCount = 0;
  for (const mod of curriculum) {
    for (const lesson of mod.lessons) {
      lessonCount++;
      totalSeconds += lesson.durationSeconds ?? 0;
    }
  }
  if (totalSeconds > 0) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes} min`;
  }
  if (lessonCount > 0) return `${lessonCount} lecciones`;
  return "Por definir";
}

export function getFirstVideoUrl(
  curriculum: Awaited<ReturnType<typeof getCourseCurriculum>>
) {
  for (const mod of curriculum) {
    for (const lesson of mod.lessons) {
      if (lesson.videoUrl) return lesson.videoUrl;
    }
  }
  return null;
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

export async function getUserCompletedLessonIds(
  userId: string,
  lessonIds: string[]
) {
  if (lessonIds.length === 0) return new Set<string>();

  const db = getDb();
  const rows = await db
    .select({ lessonId: lessonProgress.lessonId })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.completed, true),
        inArray(lessonProgress.lessonId, lessonIds)
      )
    );

  return new Set(rows.map((r) => r.lessonId));
}

export function flattenCurriculumLessons(
  curriculum: Awaited<ReturnType<typeof getCourseCurriculum>>
) {
  return curriculum.flatMap((mod) => mod.lessons);
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
