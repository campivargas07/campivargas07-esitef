import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  parseTutorVideoMeta,
  parseWpCompletionTimestamp,
  priceToCents,
} from "./parse-tutor-meta";
import type { ExtractedBundle, WpLesson } from "./types";

const PREFIX = process.env.WP_TABLE_PREFIX ?? "wp_";
const WP_COMPOSE =
  process.env.WP_DOCKER_COMPOSE ??
  "/workspaces/campivargas07-esitef/docker-compose.yml";
const WP_CWD = process.env.WP_DOCKER_CWD ?? "/workspaces/campivargas07-esitef";

function compactSql(sql: string): string {
  return sql.replace(/\s+/g, " ").trim();
}

function mysqlQuery(sql: string): string {
  const user = process.env.WP_MYSQL_USER ?? "wordpress";
  const pass = process.env.WP_MYSQL_PASSWORD ?? "wordpress";
  const db = process.env.WP_MYSQL_DATABASE ?? "wordpress";
  const query = compactSql(sql.replaceAll("{{prefix}}", PREFIX));
  return execSync(
    `docker compose -f ${WP_COMPOSE} exec -T db mariadb -u${user} -p${pass} ${db} -N -B -e ${JSON.stringify(query)}`,
    { encoding: "utf8", cwd: WP_CWD }
  ).trim();
}

function parseTsv(tsv: string, columns: string[]): Record<string, string>[] {
  if (!tsv) return [];
  return tsv.split("\n").map((line) => {
    const values = line.split("\t");
    const row: Record<string, string> = {};
    columns.forEach((col, i) => {
      row[col] = values[i] ?? "";
    });
    return row;
  });
}

export async function extractFromWordPress(
  outDir = join(import.meta.dirname, "../../../data/staging")
): Promise<ExtractedBundle> {
  mkdirSync(outDir, { recursive: true });

  const users = parseTsv(
    mysqlQuery(
      `SELECT ID, user_login, user_email, user_pass, display_name, user_registered FROM {{prefix}}users`
    ),
    ["ID", "user_login", "user_email", "user_pass", "display_name", "user_registered"]
  ).map((r) => ({
    ID: Number(r.ID),
    user_login: r.user_login,
    user_email: r.user_email,
    user_pass: r.user_pass,
    display_name: r.display_name,
    user_registered: r.user_registered,
  }));

  const courses = parseTsv(
    mysqlQuery(
      `SELECT ID, post_name, post_title, post_content, post_excerpt, post_status FROM {{prefix}}posts WHERE post_type = 'courses'`
    ),
    ["ID", "post_name", "post_title", "post_content", "post_excerpt", "post_status"]
  ).map((r) => ({
    ID: Number(r.ID),
    post_name: r.post_name,
    post_title: r.post_title,
    post_content: r.post_content,
    post_excerpt: r.post_excerpt,
    post_status: r.post_status,
  }));

  const topics = parseTsv(
    mysqlQuery(
      `SELECT ID, post_parent, post_title, menu_order, post_status FROM {{prefix}}posts WHERE post_type = 'topics' ORDER BY post_parent, menu_order`
    ),
    ["ID", "post_parent", "post_title", "menu_order", "post_status"]
  ).map((r) => ({
    ID: Number(r.ID),
    course_id: Number(r.post_parent),
    post_title: r.post_title,
    menu_order: Number(r.menu_order) || 0,
    post_status: r.post_status,
  }));

  const videoMetaRows = parseTsv(
    mysqlQuery(
      `SELECT post_id, meta_value FROM {{prefix}}postmeta WHERE meta_key = '_video'`
    ),
    ["post_id", "meta_value"]
  );
  const videoByPostId = new Map(
    videoMetaRows.map((r) => [Number(r.post_id), r.meta_value])
  );

  const lessons = parseTsv(
    mysqlQuery(
      `SELECT ID, post_parent, post_title, post_content, menu_order, post_status FROM {{prefix}}posts WHERE post_type = 'lesson' ORDER BY post_parent, menu_order`
    ),
    ["ID", "post_parent", "post_title", "post_content", "menu_order", "post_status"]
  ).map((r) => {
    const lessonId = Number(r.ID);
    const parsed = parseTutorVideoMeta(videoByPostId.get(lessonId) ?? "");
    return {
      ID: lessonId,
      topic_id: Number(r.post_parent),
      post_title: r.post_title,
      post_content: r.post_content,
      menu_order: Number(r.menu_order) || 0,
      post_status: r.post_status,
      video_url: parsed.videoUrl,
      duration_seconds: parsed.durationSeconds,
    } satisfies WpLesson;
  });

  const pricingRows = parseTsv(
    mysqlQuery(`
      SELECT c.ID AS course_id,
        wc.meta_value AS wc_price,
        tp.meta_value AS tutor_price,
        att.guid AS thumbnail_url
      FROM {{prefix}}posts c
      LEFT JOIN {{prefix}}postmeta pid ON pid.post_id = c.ID AND pid.meta_key = '_tutor_course_product_id'
      LEFT JOIN {{prefix}}postmeta wc ON wc.post_id = CAST(pid.meta_value AS UNSIGNED) AND wc.meta_key = '_price'
      LEFT JOIN {{prefix}}postmeta tp ON tp.post_id = c.ID AND tp.meta_key = 'tutor_course_price'
      LEFT JOIN {{prefix}}postmeta th ON th.post_id = c.ID AND th.meta_key = '_thumbnail_id'
      LEFT JOIN {{prefix}}posts att ON att.ID = CAST(th.meta_value AS UNSIGNED)
      WHERE c.post_type = 'courses'
    `),
    ["course_id", "wc_price", "tutor_price", "thumbnail_url"]
  );

  const coursePricing = pricingRows.map((r) => {
    const wcCents = priceToCents(r.wc_price);
    const tutorCents = priceToCents(r.tutor_price);
    return {
      course_id: Number(r.course_id),
      price_cents: wcCents > 0 ? wcCents : tutorCents,
      currency: "EUR",
      thumbnail_url:
        r.thumbnail_url && r.thumbnail_url !== "NULL"
          ? r.thumbnail_url
          : undefined,
    };
  });

  const courseIdSet = new Set(courses.map((c) => c.ID));
  const topicById = new Map(topics.map((t) => [t.ID, t]));

  const quizzes = parseTsv(
    mysqlQuery(
      `SELECT ID, post_parent, post_title, post_status FROM {{prefix}}posts WHERE post_type = 'tutor_quiz'`
    ),
    ["ID", "post_parent", "post_title", "post_status"]
  ).map((r) => {
    const parentId = Number(r.post_parent);
    const course_id = courseIdSet.has(parentId)
      ? parentId
      : (topicById.get(parentId)?.course_id ?? parentId);
    return {
      ID: Number(r.ID),
      course_id,
      post_title: r.post_title,
      post_status: r.post_status,
    };
  });

  const quizQuestions = parseTsv(
    mysqlQuery(
      `SELECT question_id, quiz_id, question_title, question_type, question_order FROM {{prefix}}tutor_quiz_questions ORDER BY quiz_id, question_order`
    ),
    ["question_id", "quiz_id", "question_title", "question_type", "question_order"]
  ).map((r) => ({
    question_id: Number(r.question_id),
    quiz_id: Number(r.quiz_id),
    question_title: r.question_title,
    question_type: r.question_type,
    question_order: Number(r.question_order) || 0,
  }));

  const quizAnswers = parseTsv(
    mysqlQuery(
      `SELECT answer_id, belongs_question_id, answer_title, is_correct, answer_order FROM {{prefix}}tutor_quiz_question_answers ORDER BY belongs_question_id, answer_order`
    ),
    ["answer_id", "belongs_question_id", "answer_title", "is_correct", "answer_order"]
  ).map((r) => ({
    answer_id: Number(r.answer_id),
    question_id: Number(r.belongs_question_id),
    answer_title: r.answer_title,
    is_correct: Number(r.is_correct) || 0,
    answer_order: Number(r.answer_order) || 0,
  }));

  const lessonProgress = parseTsv(
    mysqlQuery(`
      SELECT user_id,
        CAST(REPLACE(meta_key, '_tutor_completed_lesson_id_', '') AS UNSIGNED) AS lesson_id,
        meta_value AS completed_at_raw
      FROM {{prefix}}usermeta
      WHERE meta_key LIKE '_tutor_completed_lesson_id_%'
        AND meta_value IS NOT NULL
        AND meta_value != ''
    `),
    ["user_id", "lesson_id", "completed_at_raw"]
  )
    .map((r) => {
      const lessonId = Number(r.lesson_id);
      const completedAt = parseWpCompletionTimestamp(r.completed_at_raw);
      return {
        user_id: Number(r.user_id),
        lesson_id: lessonId,
        completed_at: completedAt?.toISOString(),
      };
    })
    .filter((r) => r.user_id > 0 && r.lesson_id > 0);

  const enrollments = parseTsv(
    mysqlQuery(
      `SELECT ID, post_author, post_parent, post_date, post_status FROM {{prefix}}posts WHERE post_type = 'tutor_enrolled'`
    ),
    ["ID", "post_author", "post_parent", "post_date", "post_status"]
  ).map((r) => ({
    ID: Number(r.ID),
    post_author: Number(r.post_author),
    post_parent: Number(r.post_parent),
    post_date: r.post_date,
    post_status: r.post_status,
  }));

  const quizAttempts = parseTsv(
    mysqlQuery(
      `SELECT attempt_id, user_id, quiz_id, course_id, earned_marks, total_marks, attempt_status, attempt_started_at, attempt_ended_at FROM {{prefix}}tutor_quiz_attempts`
    ),
    [
      "attempt_id",
      "user_id",
      "quiz_id",
      "course_id",
      "earned_marks",
      "total_marks",
      "attempt_status",
      "attempt_started_at",
      "attempt_ended_at",
    ]
  ).map((r) => ({
    attempt_id: Number(r.attempt_id),
    user_id: Number(r.user_id),
    quiz_id: Number(r.quiz_id),
    course_id: Number(r.course_id),
    earned_marks: Number(r.earned_marks),
    total_marks: Number(r.total_marks),
    attempt_status: r.attempt_status,
    attempt_started_at: r.attempt_started_at,
    attempt_ended_at: r.attempt_ended_at,
  }));

  const tutorOrders = parseTsv(
    mysqlQuery(
      `SELECT id, user_id, order_status, payment_status, total_price, created_at_gmt FROM {{prefix}}tutor_orders`
    ),
    ["id", "user_id", "order_status", "payment_status", "total_price", "created_at_gmt"]
  ).map((r) => ({
    id: Number(r.id),
    user_id: Number(r.user_id),
    status: r.payment_status || r.order_status,
    total_price: r.total_price,
    currency: "EUR",
    created_at: r.created_at_gmt,
  }));

  const wooOrders = parseTsv(
    mysqlQuery(`
      SELECT id, customer_id, status, total_amount, currency,
        payment_method, transaction_id, date_created_gmt
      FROM {{prefix}}wc_orders
      WHERE type = 'shop_order'
    `),
    [
      "id",
      "customer_id",
      "status",
      "total_amount",
      "currency",
      "payment_method",
      "transaction_id",
      "date_created_gmt",
    ]
  ).map((r) => ({
    id: Number(r.id),
    customer_id: Number(r.customer_id),
    status: r.status,
    total_amount: r.total_amount,
    currency: r.currency || "EUR",
    payment_method: r.payment_method,
    transaction_id: r.transaction_id,
    created_at: r.date_created_gmt,
  }));

  const wooOrderItems = parseTsv(
    mysqlQuery(`
      SELECT oi.order_id, oi.order_item_id, oi.order_item_name,
        MAX(CASE WHEN oim.meta_key = '_product_id' THEN oim.meta_value END) AS product_id,
        MAX(CASE WHEN oim.meta_key = '_line_total' THEN oim.meta_value END) AS line_total,
        MAX(CASE WHEN oim.meta_key = '_qty' THEN oim.meta_value END) AS qty
      FROM {{prefix}}woocommerce_order_items oi
      LEFT JOIN {{prefix}}woocommerce_order_itemmeta oim
        ON oim.order_item_id = oi.order_item_id
      WHERE oi.order_item_type = 'line_item'
      GROUP BY oi.order_id, oi.order_item_id, oi.order_item_name
    `),
    ["order_id", "order_item_id", "order_item_name", "product_id", "line_total", "qty"]
  ).map((r) => ({
    order_id: Number(r.order_id),
    order_item_id: Number(r.order_item_id),
    product_id: Number(r.product_id) || 0,
    title: r.order_item_name,
    line_total: r.line_total || "0",
    quantity: Number(r.qty) || 1,
  }));

  const courseProducts = parseTsv(
    mysqlQuery(`
      SELECT post_id AS course_id, meta_value AS product_id
      FROM {{prefix}}postmeta
      WHERE meta_key = '_tutor_course_product_id'
        AND meta_value IS NOT NULL
        AND meta_value != ''
    `),
    ["course_id", "product_id"]
  ).map((r) => ({
    course_id: Number(r.course_id),
    product_id: Number(r.product_id),
  }));

  const certificates = parseTsv(
    mysqlQuery(
      `SELECT ID, post_author, post_parent, post_date FROM {{prefix}}posts WHERE post_type = 'tutor_certificate'`
    ),
    ["ID", "post_author", "post_parent", "post_date"]
  ).map((r) => ({
    ID: Number(r.ID),
    post_author: Number(r.post_author),
    post_parent: Number(r.post_parent),
    post_date: r.post_date,
  }));

  const bundle: ExtractedBundle = {
    extractedAt: new Date().toISOString(),
    users,
    courses,
    topics,
    lessons,
    coursePricing,
    quizzes,
    quizQuestions,
    quizAnswers,
    enrollments,
    lessonProgress,
    quizAttempts,
    tutorOrders,
    wooOrders,
    wooOrderItems,
    courseProducts,
    certificates,
  };

  const file = join(outDir, "extract.json");
  writeFileSync(file, JSON.stringify(bundle, null, 2));
  console.log(`Extracted to ${file}`);
  console.log(
    `  users=${users.length} courses=${courses.length} topics=${topics.length} lessons=${lessons.length} lessonProgress=${lessonProgress.length} quizzes=${quizzes.length} wooOrders=${wooOrders.length}`
  );
  return bundle;
}

export function loadExtractedBundle(
  path = join(import.meta.dirname, "../../../data/staging/extract.json")
): ExtractedBundle {
  const raw = JSON.parse(readFileSync(path, "utf8")) as ExtractedBundle;
  return {
    ...raw,
    topics: raw.topics ?? [],
    lessons: raw.lessons ?? [],
    coursePricing: raw.coursePricing ?? [],
    quizzes: raw.quizzes ?? [],
    quizQuestions: raw.quizQuestions ?? [],
    quizAnswers: raw.quizAnswers ?? [],
    lessonProgress: raw.lessonProgress ?? [],
    wooOrders: raw.wooOrders ?? [],
    wooOrderItems: raw.wooOrderItems ?? [],
    courseProducts: raw.courseProducts ?? [],
  };
}
