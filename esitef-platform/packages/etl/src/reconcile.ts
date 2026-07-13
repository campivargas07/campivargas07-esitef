import { count, eq, isNotNull, or, sql } from "drizzle-orm";
import {
  certificates,
  courses,
  createDb,
  enrollments,
  legacyIdentities,
  lessonProgress,
  lessons,
  migrationMappings,
  modules,
  orders,
  quizAttempts,
  quizQuestions,
  quizzes,
  users,
} from "@esitef/db";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { loadExtractedBundle } from "./extract";
import type { ReconciliationReport } from "./types";

export async function reconcileMigration(
  bundle = loadExtractedBundle()
): Promise<ReconciliationReport> {
  const db = createDb();

  const [userCount] = await db.select({ c: count() }).from(users);
  const [legacyUserCount] = await db
    .select({ c: count() })
    .from(legacyIdentities);
  const [courseCount] = await db.select({ c: count() }).from(courses);
  const [courseMappingCount] = await db
    .select({ c: count() })
    .from(migrationMappings)
    .where(eq(migrationMappings.entityType, "course"));
  const [moduleCount] = await db.select({ c: count() }).from(modules);
  const [lessonCount] = await db.select({ c: count() }).from(lessons);
  const [quizCount] = await db.select({ c: count() }).from(quizzes);
  const [questionCount] = await db.select({ c: count() }).from(quizQuestions);
  const [enrollmentCount] = await db.select({ c: count() }).from(enrollments);
  const [migratedEnrollmentCount] = await db
    .select({ c: count() })
    .from(enrollments)
    .where(isNotNull(enrollments.legacyWpEnrollmentId));
  const [lessonProgressCount] = await db
    .select({ c: count() })
    .from(lessonProgress);
  const [attemptCount] = await db.select({ c: count() }).from(quizAttempts);
  const [orderCount] = await db.select({ c: count() }).from(orders);
  const [migratedOrderCount] = await db
    .select({ c: count() })
    .from(orders)
    .where(
      or(
        isNotNull(orders.legacyWpOrderId),
        isNotNull(orders.legacyTutorOrderId)
      )
    );
  const [certCount] = await db.select({ c: count() }).from(certificates);

  const courseIds = new Set(bundle.courses.map((c) => c.ID));
  const migratableTopics = bundle.topics.filter((t) =>
    courseIds.has(t.course_id)
  );
  const topicIds = new Set(migratableTopics.map((t) => t.ID));
  const migratableLessons = bundle.lessons.filter((l) =>
    topicIds.has(l.topic_id)
  );
  const lessonIds = new Set(migratableLessons.map((l) => l.ID));
  const migratableLessonProgress = bundle.lessonProgress.filter((p) =>
    lessonIds.has(p.lesson_id)
  );
  const uniqueLessonProgressKeys = new Set(
    migratableLessonProgress.map((p) => `${p.user_id}:${p.lesson_id}`)
  );

  const migratableQuizzes = bundle.quizzes.filter((q) =>
    courseIds.has(q.course_id)
  );

  const source = {
    users: bundle.users.length,
    courses: bundle.courses.length,
    topics: migratableTopics.length,
    lessons: migratableLessons.length,
    topicsOrphan: bundle.topics.length - migratableTopics.length,
    lessonsOrphan: bundle.lessons.length - migratableLessons.length,
    quizzes: migratableQuizzes.length,
    quizzesOrphan: bundle.quizzes.length - migratableQuizzes.length,
    quizQuestions: bundle.quizQuestions.length,
    enrollments: bundle.enrollments.length,
    lessonProgress: uniqueLessonProgressKeys.size,
    lessonProgressDuplicates:
      migratableLessonProgress.length - uniqueLessonProgressKeys.size,
    lessonProgressOrphan:
      bundle.lessonProgress.length - migratableLessonProgress.length,
    quizAttempts: bundle.quizAttempts.length,
    orders: bundle.tutorOrders.length + bundle.wooOrders.length,
    tutorOrders: bundle.tutorOrders.length,
    wooOrders: bundle.wooOrders.length,
    certificates: bundle.certificates.length,
  };

  const target = {
    users: userCount.c,
    migratedUsers: legacyUserCount.c,
    courses: courseCount.c,
    migratedCourses: courseMappingCount.c,
    topics: moduleCount.c,
    lessons: lessonCount.c,
    quizzes: quizCount.c,
    quizQuestions: questionCount.c,
    enrollments: enrollmentCount.c,
    migratedEnrollments: migratedEnrollmentCount.c,
    lessonProgress: lessonProgressCount.c,
    quizAttempts: attemptCount.c,
    orders: orderCount.c,
    migratedOrders: migratedOrderCount.c,
    certificates: certCount.c,
  };

  const issues: string[] = [];

  const minMatchKeys: (keyof typeof source)[] = [
    "users",
    "courses",
    "topics",
    "lessons",
    "quizzes",
  ];

  for (const key of minMatchKeys) {
    const migratedKey =
      key === "users"
        ? target.migratedUsers
        : key === "courses"
          ? target.migratedCourses
          : target[key];
    if (migratedKey < source[key]) {
      issues.push(`${key}: missing ${source[key] - migratedKey} records`);
    }
  }

  for (const key of ["enrollments", "quizAttempts", "certificates"] as const) {
    const migratedKey =
      key === "enrollments"
        ? target.migratedEnrollments
        : target[key];
    if (migratedKey > source[key]) {
      issues.push(`${key}: migrated target exceeds source`);
    }
  }

  if (
    source.lessonProgress > 0 &&
    target.lessonProgress < source.lessonProgress
  ) {
    issues.push(
      `lessonProgress: missing ${source.lessonProgress - target.lessonProgress} records`
    );
  }

  if (source.topicsOrphan > 0) {
    console.log(
      `Note: ${source.topicsOrphan} topics huérfanos en WP (sin curso padre) — omitidos`
    );
  }
  if (source.lessonsOrphan > 0) {
    console.log(
      `Note: ${source.lessonsOrphan} lessons huérfanas en WP — omitidas`
    );
  }
  if (source.quizzesOrphan > 0) {
    console.log(
      `Note: ${source.quizzesOrphan} quizzes huérfanos en WP (curso padre ausente) — omitidos`
    );
  }
  if (source.lessonProgressDuplicates > 0) {
    console.log(
      `Note: ${source.lessonProgressDuplicates} lesson progress duplicados en WP — deduplicados en destino`
    );
  }

  if (source.orders > 0 && target.migratedOrders < source.orders) {
    issues.push(
      `orders: missing ${source.orders - target.migratedOrders} migrated records`
    );
  }

  const orphanLessonProgress = await db.execute(sql`
    SELECT COUNT(*)::int AS c FROM lesson_progress lp
    LEFT JOIN users u ON u.id = lp.user_id
    LEFT JOIN lessons l ON l.id = lp.lesson_id
    WHERE u.id IS NULL OR l.id IS NULL
  `);
  if (Number((orphanLessonProgress[0] as { c: number }).c) > 0) {
    issues.push("lessonProgress: orphan user or lesson references detected");
  }

  if (source.quizQuestions > 0 && target.quizQuestions < source.quizQuestions) {
    issues.push(
      `quizQuestions: missing ${source.quizQuestions - target.quizQuestions} records`
    );
  }

  const orphanEnrollments = await db.execute(sql`
    SELECT COUNT(*)::int AS c FROM enrollments e
    LEFT JOIN users u ON u.id = e.user_id
    WHERE u.id IS NULL
  `);
  if (Number((orphanEnrollments[0] as { c: number }).c) > 0) {
    issues.push("enrollments: orphan user references detected");
  }

  const duplicateEmails = await db.execute(sql`
    SELECT email, COUNT(*)::int AS c FROM users GROUP BY email HAVING COUNT(*) > 1
  `);
  if ((duplicateEmails as unknown[]).length > 0) {
    issues.push("users: duplicate emails detected");
  }

  const deltas = Object.fromEntries(
    Object.keys(source).map((k) => {
      const key = k as keyof typeof source;
      return [key, target[key] - source[key]];
    })
  );

  const report: ReconciliationReport = {
    generatedAt: new Date().toISOString(),
    source,
    target,
    deltas,
    passed: issues.length === 0,
    issues,
  };

  const outDir = join(import.meta.dirname, "../../../docs/audit");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    join(outDir, "reconciliation-report.json"),
    JSON.stringify(report, null, 2)
  );

  console.log(report.passed ? "Reconciliation PASSED" : "Reconciliation FAILED");
  if (issues.length) console.log("Issues:", issues);
  return report;
}

export async function getMappingStats() {
  const db = createDb();
  const rows = await db
    .select({
      entityType: migrationMappings.entityType,
      c: count(),
    })
    .from(migrationMappings)
    .groupBy(migrationMappings.entityType);
  return rows;
}
