import { eq, or } from "drizzle-orm";
import {
  certificates,
  courses,
  createDb,
  enrollments,
  legacyIdentities,
  migrationMappings,
  migrationRuns,
  orders,
  quizAttempts,
  users,
} from "@esitef/db";
import { loadExtractedBundle } from "./extract";
import type { ExtractedBundle } from "./types";

function mapUserRole(wpUser: { user_email: string }): "student" | "admin" {
  if (wpUser.user_email.endsWith("@esitef.com")) return "admin";
  return "student";
}

export async function loadIntoPostgres(
  bundle: ExtractedBundle = loadExtractedBundle(),
  label = "full-import"
) {
  const db = createDb();

  const [run] = await db
    .insert(migrationRuns)
    .values({ label, status: "running" })
    .returning();

  const userIdMap = new Map<number, string>();
  const courseIdMap = new Map<number, string>();

  for (const u of bundle.users) {
    const [existing] = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, u.user_email.toLowerCase()),
          eq(users.legacyWpUserId, u.ID)
        )
      )
      .limit(1);

    if (existing) {
      userIdMap.set(u.ID, existing.id);
      continue;
    }

    const [row] = await db
      .insert(users)
      .values({
        email: u.user_email.toLowerCase(),
        name: u.display_name || u.user_login,
        role: mapUserRole(u),
        legacyWpUserId: u.ID,
        passwordMigrated: false,
        createdAt: new Date(u.user_registered),
      })
      .returning();

    userIdMap.set(u.ID, row.id);
    await db.insert(legacyIdentities).values({
      userId: row.id,
      legacyWpUserId: u.ID,
      legacyPasswordHash: u.user_pass,
    }).onConflictDoNothing();
    await db.insert(migrationMappings).values({
      entityType: "user",
      legacyId: u.ID,
      newId: row.id,
      migrationRunId: run.id,
    });
  }

  for (const c of bundle.courses) {
    const slug = c.post_name || `course-${c.ID}`;
    const [existing] = await db
      .select()
      .from(courses)
      .where(or(eq(courses.slug, slug), eq(courses.legacyWpPostId, c.ID)))
      .limit(1);

    if (existing) {
      courseIdMap.set(c.ID, existing.id);
      continue;
    }

    const [row] = await db
      .insert(courses)
      .values({
        slug,
        title: c.post_title,
        description: c.post_content,
        excerpt: c.post_excerpt,
        published: c.post_status === "publish",
        legacyWpPostId: c.ID,
      })
      .returning();

    courseIdMap.set(c.ID, row.id);
    await db.insert(migrationMappings).values({
      entityType: "course",
      legacyId: c.ID,
      newId: row.id,
      migrationRunId: run.id,
    });
  }

  for (const e of bundle.enrollments) {
    const userId = userIdMap.get(e.post_author);
    const courseId = courseIdMap.get(e.post_parent);
    if (!userId || !courseId) continue;

    await db
      .insert(enrollments)
      .values({
        userId,
        courseId,
        status: e.post_status === "completed" ? "active" : "active",
        enrolledAt: new Date(e.post_date),
        legacyWpEnrollmentId: e.ID,
      })
      .onConflictDoNothing();
  }

  for (const a of bundle.quizAttempts) {
    const userId = userIdMap.get(a.user_id);
    const courseId = courseIdMap.get(a.course_id);
    if (!userId || !courseId) continue;

    const score =
      a.total_marks > 0
        ? Math.round((Number(a.earned_marks) / Number(a.total_marks)) * 100)
        : 0;

    await db.insert(quizAttempts).values({
      quizId: courseId,
      userId,
      score,
      passed: a.attempt_status === "attempt_ended" && score >= 70,
      legacyWpAttemptId: a.attempt_id,
      attemptedAt: new Date(a.attempt_started_at),
    });
  }

  for (const o of bundle.tutorOrders) {
    const userId = userIdMap.get(o.user_id);
    const totalCents = Math.round(Number(o.total_price) * 100);

    await db.insert(orders).values({
      userId: userId ?? null,
      status:
        o.status === "completed" || o.status === "paid" ? "paid" : "pending",
      currency: o.currency || "EUR",
      totalCents,
      subtotalCents: totalCents,
      provider: "legacy",
      legacyTutorOrderId: o.id,
      paidAt:
        o.status === "completed" || o.status === "paid"
          ? new Date(o.created_at)
          : null,
    });
  }

  for (const cert of bundle.certificates) {
    const userId = userIdMap.get(cert.post_author);
    const courseId = courseIdMap.get(cert.post_parent);
    if (!userId || !courseId) continue;

    await db
      .insert(certificates)
      .values({
        userId,
        courseId,
        certificateCode: `ESITEF-${cert.ID}`,
        issuedAt: new Date(cert.post_date),
        legacyWpCertificateId: cert.ID,
      })
      .onConflictDoNothing();
  }

  const summary = {
    users: bundle.users.length,
    courses: bundle.courses.length,
    enrollments: bundle.enrollments.length,
    quizAttempts: bundle.quizAttempts.length,
    orders: bundle.tutorOrders.length,
    certificates: bundle.certificates.length,
  };

  await db
    .update(migrationRuns)
    .set({ status: "completed", finishedAt: new Date(), summary })
    .where(eq(migrationRuns.id, run.id));

  console.log("Load complete:", summary);
  return { runId: run.id, summary };
}
