import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import {
  certificates,
  courses,
  enrollments,
  lessonDiscussions,
  lessonNotes,
  lessonProgress,
  lessons,
  modules,
  orderItems,
  orders,
  quizAttempts,
  quizzes,
  users,
} from "@esitef/db";
import { getDb } from "@/lib/db";
import {
  flattenCurriculumLessons,
  sanitizeThumbnail,
} from "@/lib/lms";

export type DashboardCourse = {
  courseId: string;
  slug: string;
  title: string;
  thumbnailUrl: string | null;
  enrolledAt: Date;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  continueHref: string;
  continueLabel: string;
  nextLessonTitle: string | null;
  remainingLessons: number;
  status: "not_started" | "in_progress" | "completed";
};

export type DashboardCertificate = {
  code: string;
  courseSlug: string;
  courseTitle: string;
  issuedAt: Date;
};

export type DashboardOrder = {
  id: string;
  status: string;
  totalCents: number;
  currency: string;
  provider: string | null;
  createdAt: Date;
  paidAt: Date | null;
  items: { title: string; quantity: number }[];
};

export type DashboardQuizAttempt = {
  id: string;
  quizTitle: string;
  courseTitle: string;
  courseSlug: string;
  score: number;
  passed: boolean;
  attemptedAt: Date;
};

export type DashboardNote = {
  id: string;
  contentHtml: string;
  timestampSeconds: number | null;
  createdAt: Date;
  lessonTitle: string;
  courseTitle: string;
  courseSlug: string;
  lessonId: string;
};

export type DashboardDiscussion = {
  id: string;
  contentHtml: string;
  resolved: boolean;
  createdAt: Date;
  lessonTitle: string;
  courseTitle: string;
  courseSlug: string;
  lessonId: string;
  authorName: string | null;
  replyCount: number;
};

export type StudentDashboard = {
  courses: DashboardCourse[];
  certificates: DashboardCertificate[];
  orders: DashboardOrder[];
  quizAttempts: DashboardQuizAttempt[];
  notes: DashboardNote[];
  discussions: DashboardDiscussion[];
  continueCourse: DashboardCourse | null;
  stats: {
    enrolled: number;
    inProgress: number;
    completed: number;
    notStarted: number;
    certificates: number;
    lessonsCompletedThisWeek: number;
  };
};

function continueLessonHref(
  slug: string,
  flatLessons: { id: string; title: string }[],
  completedIds: Set<string>
) {
  if (flatLessons.length === 0) return `/cursos/${slug}`;
  const next = flatLessons.find((l) => !completedIds.has(l.id));
  if (next) return `/aprender/${slug}/${next.id}`;
  return `/quiz/${slug}`;
}

function nextLessonTitle(
  flatLessons: { id: string; title: string }[],
  completedIds: Set<string>
) {
  const next = flatLessons.find((l) => !completedIds.has(l.id));
  return next?.title ?? null;
}

function continueLabel(progressPercent: number, totalLessons: number) {
  if (totalLessons === 0) return "Ver curso";
  if (progressPercent === 0) return "Empezar curso";
  if (progressPercent >= 100) return "Repasar";
  return "Continuar";
}

function buildCurriculumFromRows(
  courseId: string,
  mods: { id: string; courseId: string; title: string; sortOrder: number }[],
  lessonRows: {
    id: string;
    moduleId: string;
    title: string;
    sortOrder: number;
  }[]
) {
  const courseMods = mods
    .filter((m) => m.courseId === courseId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return courseMods.map((mod) => ({
    ...mod,
    lessons: lessonRows
      .filter((l) => l.moduleId === mod.id)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  }));
}

export async function getStudentDashboard(
  userId: string
): Promise<StudentDashboard> {
  const db = getDb();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const enrollmentRows = await db
    .select({
      courseId: courses.id,
      slug: courses.slug,
      title: courses.title,
      thumbnailUrl: courses.thumbnailUrl,
      enrolledAt: enrollments.enrolledAt,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(
      and(eq(enrollments.userId, userId), eq(enrollments.status, "active"))
    )
    .orderBy(desc(enrollments.enrolledAt));

  const courseIds = enrollmentRows.map((e) => e.courseId);

  const modRows =
    courseIds.length > 0
      ? await db
          .select({
            id: modules.id,
            courseId: modules.courseId,
            title: modules.title,
            sortOrder: modules.sortOrder,
          })
          .from(modules)
          .where(inArray(modules.courseId, courseIds))
          .orderBy(modules.sortOrder)
      : [];

  const modIds = modRows.map((m) => m.id);
  const lessonRows =
    modIds.length > 0
      ? await db
          .select({
            id: lessons.id,
            moduleId: lessons.moduleId,
            title: lessons.title,
            sortOrder: lessons.sortOrder,
          })
          .from(lessons)
          .where(inArray(lessons.moduleId, modIds))
          .orderBy(lessons.sortOrder)
      : [];

  const completedByCourse = new Map<string, Set<string>>();
  let lessonsCompletedThisWeek = 0;

  if (courseIds.length > 0) {
    const lessonIds = lessonRows.map((r) => r.id);

    if (lessonIds.length > 0) {
      const progressRows = await db
        .select({
          lessonId: lessonProgress.lessonId,
          completedAt: lessonProgress.completedAt,
        })
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.userId, userId),
            eq(lessonProgress.completed, true),
            inArray(lessonProgress.lessonId, lessonIds)
          )
        );

      const completedLessonIds = new Set<string>();
      for (const row of progressRows) {
        completedLessonIds.add(row.lessonId);
        if (row.completedAt && row.completedAt >= weekAgo) {
          lessonsCompletedThisWeek++;
        }
      }

      for (const lesson of lessonRows) {
        if (!completedLessonIds.has(lesson.id)) continue;
        const mod = modRows.find((m) => m.id === lesson.moduleId);
        if (!mod) continue;
        let set = completedByCourse.get(mod.courseId);
        if (!set) {
          set = new Set();
          completedByCourse.set(mod.courseId, set);
        }
        set.add(lesson.id);
      }
    }
  }

  const dashboardCourses: DashboardCourse[] = [];

  for (const row of enrollmentRows) {
    const curriculum = buildCurriculumFromRows(
      row.courseId,
      modRows,
      lessonRows
    );
    const flat = flattenCurriculumLessons(curriculum);
    const completedIds =
      completedByCourse.get(row.courseId) ?? new Set<string>();
    const totalLessons = flat.length;
    const completedLessons = flat.filter((l) => completedIds.has(l.id)).length;
    const progressPercent =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    let status: DashboardCourse["status"] = "not_started";
    if (progressPercent >= 100 && totalLessons > 0) status = "completed";
    else if (completedLessons > 0) status = "in_progress";

    dashboardCourses.push({
      courseId: row.courseId,
      slug: row.slug,
      title: row.title,
      thumbnailUrl: sanitizeThumbnail(row.thumbnailUrl),
      enrolledAt: row.enrolledAt,
      totalLessons,
      completedLessons,
      progressPercent,
      continueHref: continueLessonHref(row.slug, flat, completedIds),
      continueLabel: continueLabel(progressPercent, totalLessons),
      nextLessonTitle: nextLessonTitle(flat, completedIds),
      remainingLessons: totalLessons - completedLessons,
      status,
    });
  }

  const continueCourse =
    dashboardCourses.find((c) => c.status === "in_progress") ??
    dashboardCourses.find((c) => c.status === "not_started") ??
    null;

  const certRows = await db
    .select({
      code: certificates.certificateCode,
      courseSlug: courses.slug,
      courseTitle: courses.title,
      issuedAt: certificates.issuedAt,
    })
    .from(certificates)
    .innerJoin(courses, eq(certificates.courseId, courses.id))
    .where(eq(certificates.userId, userId))
    .orderBy(desc(certificates.issuedAt));

  const orderRows = await db
    .select({
      id: orders.id,
      status: orders.status,
      totalCents: orders.totalCents,
      currency: orders.currency,
      provider: orders.provider,
      createdAt: orders.createdAt,
      paidAt: orders.paidAt,
    })
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt))
    .limit(25);

  const orderIds = orderRows.map((o) => o.id);
  const itemsByOrder = new Map<string, { title: string; quantity: number }[]>();

  if (orderIds.length > 0) {
    const items = await db
      .select({
        orderId: orderItems.orderId,
        title: orderItems.title,
        quantity: orderItems.quantity,
      })
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds));

    for (const item of items) {
      const list = itemsByOrder.get(item.orderId) ?? [];
      list.push({ title: item.title, quantity: item.quantity });
      itemsByOrder.set(item.orderId, list);
    }
  }

  const attemptRows = await db
    .select({
      id: quizAttempts.id,
      score: quizAttempts.score,
      passed: quizAttempts.passed,
      attemptedAt: quizAttempts.attemptedAt,
      quizTitle: quizzes.title,
      courseTitle: courses.title,
      courseSlug: courses.slug,
    })
    .from(quizAttempts)
    .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
    .innerJoin(courses, eq(quizzes.courseId, courses.id))
    .where(eq(quizAttempts.userId, userId))
    .orderBy(desc(quizAttempts.attemptedAt))
    .limit(50);

  const noteRows = await db
    .select({
      id: lessonNotes.id,
      contentHtml: lessonNotes.contentHtml,
      timestampSeconds: lessonNotes.timestampSeconds,
      createdAt: lessonNotes.createdAt,
      lessonId: lessonNotes.lessonId,
      lessonTitle: lessons.title,
      courseTitle: courses.title,
      courseSlug: courses.slug,
    })
    .from(lessonNotes)
    .innerJoin(lessons, eq(lessonNotes.lessonId, lessons.id))
    .innerJoin(courses, eq(lessonNotes.courseId, courses.id))
    .where(eq(lessonNotes.userId, userId))
    .orderBy(desc(lessonNotes.updatedAt))
    .limit(100);

  const discussionRows = await db
    .select({
      id: lessonDiscussions.id,
      contentHtml: lessonDiscussions.contentHtml,
      resolved: lessonDiscussions.resolved,
      createdAt: lessonDiscussions.createdAt,
      lessonId: lessonDiscussions.lessonId,
      lessonTitle: lessons.title,
      courseTitle: courses.title,
      courseSlug: courses.slug,
      authorName: users.name,
    })
    .from(lessonDiscussions)
    .innerJoin(lessons, eq(lessonDiscussions.lessonId, lessons.id))
    .innerJoin(courses, eq(lessonDiscussions.courseId, courses.id))
    .innerJoin(users, eq(lessonDiscussions.userId, users.id))
    .where(
      and(
        eq(lessonDiscussions.userId, userId),
        isNull(lessonDiscussions.parentId)
      )
    )
    .orderBy(desc(lessonDiscussions.createdAt))
    .limit(50);

  const discussionIds = discussionRows.map((d) => d.id);
  const replyCounts = new Map<string, number>();
  if (discussionIds.length > 0) {
    const replies = await db
      .select({ parentId: lessonDiscussions.parentId })
      .from(lessonDiscussions)
      .where(inArray(lessonDiscussions.parentId, discussionIds));
    for (const r of replies) {
      if (!r.parentId) continue;
      replyCounts.set(r.parentId, (replyCounts.get(r.parentId) ?? 0) + 1);
    }
  }

  const inProgress = dashboardCourses.filter(
    (c) => c.status === "in_progress"
  ).length;
  const completed = dashboardCourses.filter(
    (c) => c.status === "completed"
  ).length;
  const notStarted = dashboardCourses.filter(
    (c) => c.status === "not_started"
  ).length;

  return {
    courses: dashboardCourses,
    certificates: certRows,
    orders: orderRows.map((o) => ({
      ...o,
      provider: o.provider,
      items: itemsByOrder.get(o.id) ?? [],
    })),
    quizAttempts: attemptRows,
    notes: noteRows,
    discussions: discussionRows.map((d) => ({
      ...d,
      replyCount: replyCounts.get(d.id) ?? 0,
    })),
    continueCourse,
    stats: {
      enrolled: dashboardCourses.length,
      inProgress,
      completed,
      notStarted,
      certificates: certRows.length,
      lessonsCompletedThisWeek,
    },
  };
}

export function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function formatDashboardDate(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export type DashboardTab =
  | "home"
  | "courses"
  | "certificates"
  | "orders"
  | "profile"
  | "quiz-attempts"
  | "notes"
  | "discussions"
  | "preferences";

export function parseDashboardTab(raw?: string | null): DashboardTab {
  const valid: DashboardTab[] = [
    "home",
    "courses",
    "certificates",
    "orders",
    "profile",
    "quiz-attempts",
    "notes",
    "discussions",
    "preferences",
  ];
  if (!raw) return "home";
  if (valid.includes(raw as DashboardTab)) return raw as DashboardTab;
  return "home";
}

export type CourseFilter = "all" | "in_progress" | "completed" | "not_started";

export function parseCourseFilter(raw?: string | null): CourseFilter {
  const valid: CourseFilter[] = [
    "in_progress",
    "completed",
    "not_started",
  ];
  if (raw && valid.includes(raw as CourseFilter)) return raw as CourseFilter;
  return "all";
}
