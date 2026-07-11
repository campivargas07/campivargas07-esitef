#!/usr/bin/env tsx
/**
 * Audits WordPress/Tutor LMS/WooCommerce source database.
 * Run: npm run audit (from esitef-platform/)
 */
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const OUT_DIR = join(ROOT, "docs/audit");
const WP_COMPOSE =
  process.env.WP_DOCKER_COMPOSE ??
  "/workspaces/campivargas07-esitef/docker-compose.yml";
const WP_CWD = process.env.WP_DOCKER_CWD ?? "/workspaces/campivargas07-esitef";

type CountRow = { entity: string; cnt: number };

function compactSql(sql: string): string {
  return sql.replace(/\s+/g, " ").trim();
}

function runMysql(query: string): string {
  const host = process.env.WP_MYSQL_HOST ?? "127.0.0.1";
  const port = process.env.WP_MYSQL_PORT ?? "3306";
  const user = process.env.WP_MYSQL_USER ?? "wordpress";
  const pass = process.env.WP_MYSQL_PASSWORD ?? "wordpress";
  const db = process.env.WP_MYSQL_DATABASE ?? "wordpress";
  const prefix = process.env.WP_TABLE_PREFIX ?? "wp_";

  const sql = compactSql(query.replaceAll("{{prefix}}", prefix));

  try {
    return execSync(
      `docker compose -f ${WP_COMPOSE} exec -T db mariadb -u${user} -p${pass} ${db} -N -e ${JSON.stringify(sql)}`,
      { encoding: "utf8", cwd: WP_CWD }
    ).trim();
  } catch {
    return "";
  }
}

function runWp(args: string): string {
  try {
    return execSync(
      `docker compose -f ${WP_COMPOSE} run --rm wpcli wp ${args}`,
      { encoding: "utf8", cwd: WP_CWD, stdio: ["pipe", "pipe", "pipe"] }
    ).trim();
  } catch {
    return "";
  }
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const wpVersion = runWp("core version");
  const plugins = runWp("plugin list --format=json");
  const hpos = runWp("option get woocommerce_custom_orders_table_enabled");

  const countsQuery = `
SELECT 'users' AS entity, COUNT(*) AS cnt FROM {{prefix}}users
UNION ALL SELECT 'courses', COUNT(*) FROM {{prefix}}posts WHERE post_type='courses' AND post_status='publish'
UNION ALL SELECT 'lessons', COUNT(*) FROM {{prefix}}posts WHERE post_type='lesson' AND post_status='publish'
UNION ALL SELECT 'topics', COUNT(*) FROM {{prefix}}posts WHERE post_type='topics' AND post_status='publish'
UNION ALL SELECT 'tutor_enrolled', COUNT(*) FROM {{prefix}}posts WHERE post_type='tutor_enrolled'
UNION ALL SELECT 'quiz_attempts', COUNT(*) FROM {{prefix}}tutor_quiz_attempts
UNION ALL SELECT 'tutor_orders', COUNT(*) FROM {{prefix}}tutor_orders
UNION ALL SELECT 'wc_orders_hpos', COUNT(*) FROM {{prefix}}wc_orders
UNION ALL SELECT 'wc_legacy_orders', COUNT(*) FROM {{prefix}}posts WHERE post_type='shop_order'
UNION ALL SELECT 'certificates', COUNT(*) FROM {{prefix}}posts WHERE post_type='tutor_certificate'
UNION ALL SELECT 'products', COUNT(*) FROM {{prefix}}posts WHERE post_type='product' AND post_status='publish';
`;

  const countsRaw = runMysql(countsQuery);
  const counts: CountRow[] = countsRaw
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [entity, cnt] = line.split("\t");
      return { entity, cnt: Number(cnt) };
    });

  const tablesRaw = runMysql("SHOW TABLES LIKE '{{prefix}}%';");
  const tables = tablesRaw.split("\n").filter(Boolean);

  const tutorTables = tables.filter((t) => t.includes("tutor"));
  const wcTables = tables.filter((t) => t.includes("wc_") || t.includes("woocommerce"));

  const passwordFormats = runMysql(`
SELECT
  CASE
    WHEN user_pass LIKE '$wp$%' THEN 'wp_bcrypt'
    WHEN user_pass LIKE '$P$%' THEN 'phpass'
    WHEN LENGTH(user_pass) = 32 THEN 'md5_legacy'
    ELSE 'other'
  END AS hash_type,
  COUNT(*) AS cnt
FROM {{prefix}}users
GROUP BY hash_type;
`);

  const report = {
    generatedAt: new Date().toISOString(),
    environment: "local-docker",
    wordpress: {
      version: wpVersion || "unknown",
      hposEnabled: hpos === "yes",
    },
    plugins: plugins ? JSON.parse(plugins) : [],
    tableCounts: {
      total: tables.length,
      tutor: tutorTables.length,
      woocommerce: wcTables.length,
    },
    entityCounts: counts,
    passwordHashDistribution: passwordFormats,
    tutorTables,
    recommendations: [
      "Preserve legacy_wp_user_id on every migrated user.",
      "Use progressive password bridge for phpass and $wp$ hashes.",
      "Import tutor_enrolled from wp_posts (post_type=tutor_enrolled).",
      "Reconcile both wp_tutor_orders and wp_wc_orders (HPOS enabled).",
      "Do not grant course access from checkout success URL; use webhooks only.",
    ],
  };

  const md = `# Auditoría de origen — ESITEF

Generado: ${report.generatedAt}

## Versiones

| Componente | Valor |
|------------|-------|
| WordPress | ${report.wordpress.version} |
| WooCommerce HPOS | ${report.wordpress.hposEnabled ? "Sí" : "No"} |

## Plugins activos

${report.plugins
  .filter((p: { status: string }) => p.status === "active")
  .map((p: { name: string; version: string }) => `- **${p.name}** ${p.version}`)
  .join("\n")}

## Conteos por entidad

| Entidad | Cantidad |
|---------|----------|
${counts.map((c) => `| ${c.entity} | ${c.cnt} |`).join("\n")}

## Distribución de hashes de contraseña

\`\`\`
${passwordFormats || "N/A"}
\`\`\`

## Tablas Tutor (${tutorTables.length})

${tutorTables.map((t) => `- \`${t}\``).join("\n")}

## Recomendaciones

${report.recommendations.map((r) => `- ${r}`).join("\n")}
`;

  writeFileSync(join(OUT_DIR, "audit-report.json"), JSON.stringify(report, null, 2));
  writeFileSync(join(OUT_DIR, "AUDIT-REPORT.md"), md);

  console.log("Audit complete:");
  console.log(`  ${join(OUT_DIR, "AUDIT-REPORT.md")}`);
  console.log(`  ${join(OUT_DIR, "audit-report.json")}`);
  console.log("\nEntity counts:");
  for (const c of counts) {
    console.log(`  ${c.entity}: ${c.cnt}`);
  }
}

main();
