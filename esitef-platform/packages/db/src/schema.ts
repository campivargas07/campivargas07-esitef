import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "student",
  "instructor",
  "admin",
]);

export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "active",
  "expired",
  "cancelled",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
  "cancelled",
]);

export const paymentProviderEnum = pgEnum("payment_provider", [
  "stripe",
  "paypal",
  "dlocal",
  "manual",
  "legacy",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    name: text("name"),
    role: userRoleEnum("role").notNull().default("student"),
    passwordHash: text("password_hash"),
    emailVerified: timestamp("email_verified", { withTimezone: true }),
    legacyWpUserId: integer("legacy_wp_user_id"),
    passwordMigrated: boolean("password_migrated").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    emailIdx: uniqueIndex("users_email_idx").on(t.email),
    legacyIdx: uniqueIndex("users_legacy_wp_user_id_idx").on(t.legacyWpUserId),
  })
);

export const legacyIdentities = pgTable("legacy_identities", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  legacyWpUserId: integer("legacy_wp_user_id").notNull(),
  legacyPasswordHash: text("legacy_password_hash").notNull(),
  migratedAt: timestamp("migrated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const migrationRuns = pgTable("migration_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  label: text("label").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  status: text("status").notNull().default("running"),
  summary: jsonb("summary").$type<Record<string, unknown>>(),
});

export const migrationMappings = pgTable(
  "migration_mappings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entityType: text("entity_type").notNull(),
    legacyId: integer("legacy_id").notNull(),
    newId: uuid("new_id").notNull(),
    migrationRunId: uuid("migration_run_id").references(
      () => migrationRuns.id,
      { onDelete: "cascade" }
    ),
  },
  (t) => ({
    entityLegacyIdx: uniqueIndex("migration_mappings_entity_legacy_idx").on(
      t.entityType,
      t.legacyId
    ),
  })
);

export const courses = pgTable(
  "courses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    excerpt: text("excerpt"),
    thumbnailUrl: text("thumbnail_url"),
    priceCents: integer("price_cents").notNull().default(0),
    currency: text("currency").notNull().default("EUR"),
    stripePriceId: text("stripe_price_id"),
    published: boolean("published").notNull().default(false),
    legacyWpPostId: integer("legacy_wp_post_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("courses_slug_idx").on(t.slug),
    legacyIdx: uniqueIndex("courses_legacy_wp_post_id_idx").on(
      t.legacyWpPostId
    ),
  })
);

export const modules = pgTable("modules", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  legacyWpPostId: integer("legacy_wp_post_id"),
});

export const lessons = pgTable("lessons", {
  id: uuid("id").primaryKey().defaultRandom(),
  moduleId: uuid("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  contentHtml: text("content_html"),
  videoUrl: text("video_url"),
  durationSeconds: integer("duration_seconds"),
  sortOrder: integer("sort_order").notNull().default(0),
  legacyWpPostId: integer("legacy_wp_post_id"),
});

export const enrollments = pgTable(
  "enrollments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    status: enrollmentStatusEnum("status").notNull().default("active"),
    enrolledAt: timestamp("enrolled_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    legacyWpEnrollmentId: integer("legacy_wp_enrollment_id"),
  },
  (t) => ({
    userCourseIdx: uniqueIndex("enrollments_user_course_idx").on(
      t.userId,
      t.courseId
    ),
  })
);

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    completed: boolean("completed").notNull().default(false),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userLessonIdx: uniqueIndex("lesson_progress_user_lesson_idx").on(
      t.userId,
      t.lessonId
    ),
  })
);

export const quizzes = pgTable("quizzes", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  passingScore: integer("passing_score").notNull().default(70),
  legacyWpPostId: integer("legacy_wp_post_id"),
});

export const quizQuestions = pgTable("quiz_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  quizId: uuid("quiz_id")
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  prompt: text("prompt").notNull(),
  options: jsonb("options").$type<string[]>().notNull(),
  correctIndex: integer("correct_index").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  legacyWpQuestionId: integer("legacy_wp_question_id"),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  quizId: uuid("quiz_id")
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  passed: boolean("passed").notNull(),
  answers: jsonb("answers").$type<Record<string, number>>(),
  attemptedAt: timestamp("attempted_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  legacyWpAttemptId: integer("legacy_wp_attempt_id"),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  status: orderStatusEnum("status").notNull().default("pending"),
  currency: text("currency").notNull().default("EUR"),
  subtotalCents: integer("subtotal_cents").notNull().default(0),
  taxCents: integer("tax_cents").notNull().default(0),
  totalCents: integer("total_cents").notNull().default(0),
  provider: paymentProviderEnum("provider"),
  providerOrderId: text("provider_order_id"),
  providerCustomerId: text("provider_customer_id"),
  legacyWpOrderId: integer("legacy_wp_order_id"),
  legacyTutorOrderId: integer("legacy_tutor_order_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  courseId: uuid("course_id").references(() => courses.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPriceCents: integer("unit_price_cents").notNull(),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  provider: paymentProviderEnum("provider").notNull(),
  providerPaymentId: text("provider_payment_id").notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull(),
  status: text("status").notNull(),
  rawPayload: jsonb("raw_payload"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const certificates = pgTable(
  "certificates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    certificateCode: text("certificate_code").notNull(),
    issuedAt: timestamp("issued_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    legacyWpCertificateId: integer("legacy_wp_certificate_id"),
  },
  (t) => ({
    codeIdx: uniqueIndex("certificates_code_idx").on(t.certificateCode),
  })
);

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: paymentProviderEnum("provider").notNull(),
    externalEventId: text("external_event_id").notNull(),
    eventType: text("event_type").notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    payload: jsonb("payload"),
  },
  (t) => ({
    providerEventIdx: uniqueIndex("webhook_events_provider_event_idx").on(
      t.provider,
      t.externalEventId
    ),
  })
);

export const pages = pgTable(
  "pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    template: text("template").notNull().default("default"),
    contentJson: jsonb("content_json").$type<Record<string, unknown>>(),
    published: boolean("published").notNull().default(true),
    legacyWpPostId: integer("legacy_wp_post_id"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("pages_slug_idx").on(t.slug),
  })
);
