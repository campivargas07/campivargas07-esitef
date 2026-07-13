import { and, eq, or } from "drizzle-orm";
import {
  certificates,
  courses,
  createDb,
  enrollments,
  legacyIdentities,
  lessonProgress,
  lessons,
  migrationMappings,
  migrationRuns,
  modules,
  orderItems,
  orders,
  quizAttempts,
  quizQuestions,
  quizzes,
  users,
} from "@esitef/db";
import { loadExtractedBundle } from "./extract";
import type { ExtractedBundle } from "./types";

function sanitizeThumbnail(url?: string | null): string | null {
  if (!url || url === "NULL") return null;
  return url;
}

function mapLegacyOrderStatus(
  status: string
): "pending" | "paid" | "failed" | "refunded" | "cancelled" {
  const s = status.replace(/^wc-/, "").toLowerCase();
  if (["completed", "processing", "paid"].includes(s)) return "paid";
  if (s === "refunded") return "refunded";
  if (["cancelled", "canceled", "failed", "trash"].includes(s)) return "cancelled";
  return "pending";
}

function mapWooProvider(
  method: string
): "stripe" | "paypal" | "dlocal" | "manual" | "legacy" {
  const m = method.toLowerCase();
  if (m.includes("stripe")) return "stripe";
  if (m.includes("paypal") || m === "ppcp-gateway") return "paypal";
  if (m.includes("dlocal") || m.includes("mercadopago")) return "dlocal";
  return "legacy";
}

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
  const moduleIdMap = new Map<number, string>();
  const lessonIdMap = new Map<number, string>();
  const quizIdMap = new Map<number, string>();

  const pricingByCourse = new Map(
    bundle.coursePricing.map((p) => [p.course_id, p])
  );

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
      await db
        .insert(legacyIdentities)
        .values({
          userId: existing.id,
          legacyWpUserId: u.ID,
          legacyPasswordHash: u.user_pass,
        })
        .onConflictDoUpdate({
          target: legacyIdentities.legacyWpUserId,
          set: {
            legacyPasswordHash: u.user_pass,
            userId: existing.id,
          },
        });
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
    await db
      .insert(legacyIdentities)
      .values({
        userId: row.id,
        legacyWpUserId: u.ID,
        legacyPasswordHash: u.user_pass,
      })
      .onConflictDoNothing();
    await db.insert(migrationMappings).values({
      entityType: "user",
      legacyId: u.ID,
      newId: row.id,
      migrationRunId: run.id,
    });
  }

  for (const c of bundle.courses) {
    const slug = c.post_name || `course-${c.ID}`;
    const pricing = pricingByCourse.get(c.ID);

    const [existing] = await db
      .select()
      .from(courses)
      .where(or(eq(courses.slug, slug), eq(courses.legacyWpPostId, c.ID)))
      .limit(1);

    if (existing) {
      courseIdMap.set(c.ID, existing.id);
      await db
        .update(courses)
        .set({
          title: c.post_title,
          description: c.post_content,
          excerpt: c.post_excerpt,
          published: c.post_status === "publish",
          priceCents: pricing?.price_cents ?? existing.priceCents,
          currency: pricing?.currency ?? existing.currency,
          thumbnailUrl:
            sanitizeThumbnail(pricing?.thumbnail_url) ??
            sanitizeThumbnail(existing.thumbnailUrl),
          updatedAt: new Date(),
        })
        .where(eq(courses.id, existing.id));
      await db
        .insert(migrationMappings)
        .values({
          entityType: "course",
          legacyId: c.ID,
          newId: existing.id,
          migrationRunId: run.id,
        })
        .onConflictDoUpdate({
          target: [
            migrationMappings.entityType,
            migrationMappings.legacyId,
          ],
          set: { newId: existing.id, migrationRunId: run.id },
        });
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
        priceCents: pricing?.price_cents ?? 0,
        currency: pricing?.currency ?? "EUR",
        thumbnailUrl: sanitizeThumbnail(pricing?.thumbnail_url),
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

  for (const topic of bundle.topics) {
    const courseId = courseIdMap.get(topic.course_id);
    if (!courseId) continue;

    const [existing] = await db
      .select()
      .from(modules)
      .where(eq(modules.legacyWpPostId, topic.ID))
      .limit(1);

    if (existing) {
      moduleIdMap.set(topic.ID, existing.id);
      continue;
    }

    const [row] = await db
      .insert(modules)
      .values({
        courseId,
        title: topic.post_title,
        sortOrder: topic.menu_order,
        legacyWpPostId: topic.ID,
      })
      .returning();

    moduleIdMap.set(topic.ID, row.id);
    await db.insert(migrationMappings).values({
      entityType: "module",
      legacyId: topic.ID,
      newId: row.id,
      migrationRunId: run.id,
    });
  }

  for (const lesson of bundle.lessons) {
    const moduleId = moduleIdMap.get(lesson.topic_id);
    if (!moduleId) continue;

    const [existing] = await db
      .select()
      .from(lessons)
      .where(eq(lessons.legacyWpPostId, lesson.ID))
      .limit(1);

    if (existing) {
      lessonIdMap.set(lesson.ID, existing.id);
      await db
        .update(lessons)
        .set({
          title: lesson.post_title,
          contentHtml: lesson.post_content,
          videoUrl: lesson.video_url,
          durationSeconds: lesson.duration_seconds,
          sortOrder: lesson.menu_order,
        })
        .where(eq(lessons.id, existing.id));
      continue;
    }

    const [row] = await db
      .insert(lessons)
      .values({
        moduleId,
        title: lesson.post_title,
        contentHtml: lesson.post_content,
        videoUrl: lesson.video_url,
        durationSeconds: lesson.duration_seconds,
        sortOrder: lesson.menu_order,
        legacyWpPostId: lesson.ID,
      })
      .returning();

    lessonIdMap.set(lesson.ID, row.id);
    await db.insert(migrationMappings).values({
      entityType: "lesson",
      legacyId: lesson.ID,
      newId: row.id,
      migrationRunId: run.id,
    });
  }

  const answersByQuestion = new Map<number, typeof bundle.quizAnswers>();
  for (const answer of bundle.quizAnswers) {
    const list = answersByQuestion.get(answer.question_id) ?? [];
    list.push(answer);
    answersByQuestion.set(answer.question_id, list);
  }

  for (const quiz of bundle.quizzes) {
    const courseId = courseIdMap.get(quiz.course_id);
    if (!courseId) continue;

    const [existing] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.legacyWpPostId, quiz.ID))
      .limit(1);

    let quizUuid: string;
    if (existing) {
      quizIdMap.set(quiz.ID, existing.id);
      quizUuid = existing.id;
    } else {
      const [row] = await db
        .insert(quizzes)
        .values({
          courseId,
          title: quiz.post_title,
          passingScore: 70,
          legacyWpPostId: quiz.ID,
        })
        .returning();
      quizIdMap.set(quiz.ID, row.id);
      quizUuid = row.id;
      await db.insert(migrationMappings).values({
        entityType: "quiz",
        legacyId: quiz.ID,
        newId: row.id,
        migrationRunId: run.id,
      });
    }

    const questions = bundle.quizQuestions.filter((q) => q.quiz_id === quiz.ID);
    for (const question of questions) {
      const answers = (answersByQuestion.get(question.question_id) ?? []).sort(
        (a, b) => a.answer_order - b.answer_order
      );
      const options = answers.map((a) => a.answer_title);
      const correctIndex = Math.max(
        0,
        answers.findIndex((a) => a.is_correct === 1)
      );

      const [existingQuestion] = await db
        .select()
        .from(quizQuestions)
        .where(eq(quizQuestions.legacyWpQuestionId, question.question_id))
        .limit(1);

      if (existingQuestion) continue;

      await db.insert(quizQuestions).values({
        quizId: quizUuid,
        prompt: question.question_title,
        options: options.length > 0 ? options : ["Sí", "No"],
        correctIndex: options.length > 0 ? correctIndex : 0,
        sortOrder: question.question_order,
        legacyWpQuestionId: question.question_id,
      });
    }
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
        status: "active",
        enrolledAt: new Date(e.post_date),
        legacyWpEnrollmentId: e.ID,
      })
      .onConflictDoNothing();
  }

  for (const progress of bundle.lessonProgress) {
    const userId = userIdMap.get(progress.user_id);
    const lessonId = lessonIdMap.get(progress.lesson_id);
    if (!userId || !lessonId) continue;

    const completedAt = progress.completed_at
      ? new Date(progress.completed_at)
      : new Date();

    await db
      .insert(lessonProgress)
      .values({
        userId,
        lessonId,
        completed: true,
        completedAt,
      })
      .onConflictDoUpdate({
        target: [lessonProgress.userId, lessonProgress.lessonId],
        set: {
          completed: true,
          completedAt,
          updatedAt: new Date(),
        },
      });
  }

  for (const a of bundle.quizAttempts) {
    const userId = userIdMap.get(a.user_id);
    const quizId = quizIdMap.get(a.quiz_id);
    if (!userId || !quizId) continue;

    const score =
      a.total_marks > 0
        ? Math.round((Number(a.earned_marks) / Number(a.total_marks)) * 100)
        : 0;

    const [existing] = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.legacyWpAttemptId, a.attempt_id))
      .limit(1);
    if (existing) continue;

    await db.insert(quizAttempts).values({
      quizId,
      userId,
      score,
      passed: a.attempt_status === "attempt_ended" && score >= 70,
      legacyWpAttemptId: a.attempt_id,
      attemptedAt: new Date(a.attempt_started_at),
    });
  }

  for (const o of bundle.tutorOrders) {
    const [existing] = await db
      .select()
      .from(orders)
      .where(eq(orders.legacyTutorOrderId, o.id))
      .limit(1);
    if (existing) continue;

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

  const productToCourse = new Map<number, string>();
  for (const cp of bundle.courseProducts) {
    const courseUuid = courseIdMap.get(cp.course_id);
    if (courseUuid) productToCourse.set(cp.product_id, courseUuid);
  }

  const wooItemsByOrder = new Map<number, (typeof bundle.wooOrderItems)[number][]>();
  for (const item of bundle.wooOrderItems) {
    const list = wooItemsByOrder.get(item.order_id) ?? [];
    list.push(item);
    wooItemsByOrder.set(item.order_id, list);
  }

  for (const o of bundle.wooOrders) {
    const [existing] = await db
      .select()
      .from(orders)
      .where(eq(orders.legacyWpOrderId, o.id))
      .limit(1);
    if (existing) continue;

    const userId = userIdMap.get(o.customer_id);
    const totalCents = Math.round(Number(o.total_amount) * 100);
    const status = mapLegacyOrderStatus(o.status);

    const [order] = await db
      .insert(orders)
      .values({
        userId: userId ?? null,
        status,
        currency: o.currency || "EUR",
        totalCents,
        subtotalCents: totalCents,
        provider: mapWooProvider(o.payment_method),
        legacyWpOrderId: o.id,
        providerOrderId: o.transaction_id || null,
        metadata: { payment_method: o.payment_method },
        paidAt:
          status === "paid" && o.created_at ? new Date(o.created_at) : null,
      })
      .returning();

    for (const item of wooItemsByOrder.get(o.id) ?? []) {
      const lineCents = Math.round(Number(item.line_total) * 100);
      await db.insert(orderItems).values({
        orderId: order.id,
        courseId: item.product_id
          ? (productToCourse.get(item.product_id) ?? null)
          : null,
        title: item.title,
        quantity: item.quantity,
        unitPriceCents:
          item.quantity > 0 ? Math.round(lineCents / item.quantity) : lineCents,
      });
    }
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
    topics: bundle.topics.length,
    lessons: bundle.lessons.length,
    quizzes: bundle.quizzes.length,
    quizQuestions: bundle.quizQuestions.length,
    enrollments: bundle.enrollments.length,
    lessonProgress: bundle.lessonProgress.length,
    quizAttempts: bundle.quizAttempts.length,
    orders: bundle.tutorOrders.length + bundle.wooOrders.length,
    wooOrders: bundle.wooOrders.length,
    certificates: bundle.certificates.length,
  };

  await db
    .update(migrationRuns)
    .set({ status: "completed", finishedAt: new Date(), summary })
    .where(eq(migrationRuns.id, run.id));

  console.log("Load complete:", summary);
  return { runId: run.id, summary };
}
