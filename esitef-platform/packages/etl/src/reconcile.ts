import { count, eq, sql } from "drizzle-orm";
import {
  certificates,
  courses,
  createDb,
  enrollments,
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
  const [courseCount] = await db.select({ c: count() }).from(courses);
  const [moduleCount] = await db.select({ c: count() }).from(modules);
  const [lessonCount] = await db.select({ c: count() }).from(lessons);
  const [quizCount] = await db.select({ c: count() }).from(quizzes);
  const [questionCount] = await db.select({ c: count() }).from(quizQuestions);
  const [enrollmentCount] = await db.select({ c: count() }).from(enrollments);
  const [lessonProgressCount] = await db
    .select({ c: count() })
    .from(lessonProgress);
  const [attemptCount] = await db.select({ c: count() }).from(quizAttempts);
  const [orderCount] = await db.select({ c: count() }).from(orders);
  const [certCount] = await db.select({ c: count() }).from(certificates);

  const source = {
    users: bundle.users.length,
    courses: bundle.courses.length,
    topics: bundle.topics.length,
    lessons: bundle.lessons.length,
    quizzes: bundle.quizzes.length,
    quizQuestions: bundle.quizQuestions.length,
    enrollments: bundle.enrollments.length,
    lessonProgress: bundle.lessonProgress.length,
    quizAttempts: bundle.quizAttempts.length,
    orders: bundle.tutorOrders.length,
    certificates: bundle.certificates.length,
  };

  const target = {
    users: userCount.c,
    courses: courseCount.c,
    topics: moduleCount.c,
    lessons: lessonCount.c,
    quizzes: quizCount.c,
    quizQuestions: questionCount.c,
    enrollments: enrollmentCount.c,
    lessonProgress: lessonProgressCount.c,
    quizAttempts: attemptCount.c,
    orders: orderCount.c,
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
    if (target[key] < source[key]) {
      issues.push(`${key}: missing ${source[key] - target[key]} records`);
    }
  }

  for (const key of ["enrollments", "quizAttempts", "certificates"] as const) {
    if (target[key] > source[key]) {
      issues.push(`${key}: target exceeds source`);
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
