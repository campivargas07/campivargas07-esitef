import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { ExtractedBundle } from "./types";

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
    enrollments,
    quizAttempts,
    tutorOrders,
    certificates,
  };

  const file = join(outDir, "extract.json");
  writeFileSync(file, JSON.stringify(bundle, null, 2));
  console.log(`Extracted to ${file}`);
  console.log(
    `  users=${bundle.users.length} courses=${bundle.courses.length} enrollments=${bundle.enrollments.length}`
  );
  return bundle;
}

export function loadExtractedBundle(
  path = join(import.meta.dirname, "../../../data/staging/extract.json")
): ExtractedBundle {
  return JSON.parse(readFileSync(path, "utf8")) as ExtractedBundle;
}
