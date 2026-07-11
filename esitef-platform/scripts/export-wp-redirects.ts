#!/usr/bin/env tsx
/**
 * Export 301 redirects from WordPress (Redirection plugin + Tutor slugs) → wp-redirects.json
 * Usage: npm run export:wp-redirects
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createDb, courses } from "@esitef/db";
import { eq } from "drizzle-orm";

const ROOT = join(import.meta.dirname, "..");
const OUT = join(ROOT, "apps/web/src/data/wp-redirects.json");
const HUBS_PATH = join(ROOT, "apps/web/src/data/formaciones-hubs.json");
const PREFIX = process.env.WP_TABLE_PREFIX ?? "yrc_";
const WP_COMPOSE =
  process.env.WP_DOCKER_COMPOSE ??
  "/workspaces/campivargas07-esitef/docker-compose.yml";
const WP_CWD = process.env.WP_DOCKER_CWD ?? "/workspaces/campivargas07-esitef";
const ONLINE_BASE = (process.env.WP_ONLINE_PATH ?? "/online").replace(/\/$/, "");

function mysqlQuery(sql: string): string {
  const user = process.env.WP_MYSQL_USER ?? "wordpress";
  const pass = process.env.WP_MYSQL_PASSWORD ?? "wordpress";
  const db = process.env.WP_MYSQL_DATABASE ?? "wordpress";
  const query = sql.replaceAll("{{prefix}}", PREFIX).replace(/\s+/g, " ").trim();
  return execSync(
    `docker compose -f ${WP_COMPOSE} exec -T db mariadb -u${user} -p${pass} ${db} -N -B -e ${JSON.stringify(query)}`,
    { encoding: "utf8", cwd: WP_CWD }
  ).trim();
}

function stripOnlineBase(path: string): string {
  let p = path.replace(/\/+$/, "").replace(/^\/+/, "");
  if (p === "online") return "";
  if (p.startsWith("online/")) return p.slice("online/".length);
  return p;
}

function normalizeDest(input: string): string {
  let path = input.trim();
  if (!path) return "";

  try {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      path = new URL(path).pathname;
    }
  } catch {
    /* keep */
  }

  return stripOnlineBase(path);
}

function addRedirect(map: Record<string, string>, from: string, to: string) {
  const source = stripOnlineBase(from);
  const dest = normalizeDest(to);
  if (!source || !dest || source === dest) return;
  map[source] = dest;
}

function addOnlineRedirect(map: Record<string, string>, from: string, to: string) {
  const tail = stripOnlineBase(from);
  if (!tail) return;
  const source = `online/${tail}`;
  const dest = normalizeDest(to);
  if (!dest || source === dest) return;
  map[source] = dest;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL required");
  }

  const redirects: Record<string, string> = {};

  // Tutor / dashboard paths (WP bajo /online)
  const dashboardPaths = [
    "dashboard",
    "dashboard/my-courses",
    "dashboard/enrolled-courses",
    "dashboard/purchase-history",
    "dashboard/my-profile",
    "dashboard/settings",
    "dashboard/reviews",
    "dashboard/wishlist",
  ];
  for (const p of dashboardPaths) {
    addOnlineRedirect(redirects, `${ONLINE_BASE}/${p}`, "dashboard");
  }

  addOnlineRedirect(redirects, `${ONLINE_BASE}/formaciones`, "formaciones");
  addOnlineRedirect(redirects, `${ONLINE_BASE}/courses`, "formaciones");
  addOnlineRedirect(redirects, `${ONLINE_BASE}/ingresar`, "ingresar");
  addOnlineRedirect(redirects, `${ONLINE_BASE}/wp-login.php`, "ingresar");

  const hubSlugs = Object.keys(
    JSON.parse(readFileSync(HUBS_PATH, "utf8")) as Record<string, unknown>
  );
  for (const hub of hubSlugs) {
    addOnlineRedirect(redirects, `${ONLINE_BASE}/${hub}`, `formaciones/${hub}`);
  }

  // Redirection plugin (producción usa yrc_redirection_items)
  try {
    const rows = mysqlQuery(
      `SELECT url, action_code, action_data FROM {{prefix}}redirection_items WHERE status='enabled' AND action_type='url'`
    );
    if (rows) {
      for (const line of rows.split("\n")) {
        const [from, code, target] = line.split("\t");
        if (!from || !target || code !== "301") continue;
        const dest = normalizeDest(target);
        if (!dest) continue;
        addOnlineRedirect(redirects, from, dest);
      }
    }
  } catch (err) {
    console.warn("Redirection plugin query skipped:", err);
  }

  // Cursos publicados: /online/{slug} → /cursos/{slug}
  const db = createDb(process.env.DATABASE_URL);
  const published = await db
    .select({ slug: courses.slug })
    .from(courses)
    .where(eq(courses.published, true));

  for (const { slug } of published) {
    if (hubSlugs.includes(slug)) continue;
    addOnlineRedirect(redirects, `${ONLINE_BASE}/${slug}`, `cursos/${slug}`);
  }

  // Normalizar entradas del plugin que apuntan a rutas WP internas
  for (const [from, to] of Object.entries({ ...redirects })) {
    if (dashboardPaths.some((p) => to === p || to.endsWith(`/${p}`))) {
      redirects[from] = "dashboard";
    }
    if (to === "formaciones" || to.endsWith("/formaciones")) {
      redirects[from] = "formaciones";
    }
    if (hubSlugs.some((h) => to === h || to.endsWith(`/${h}`))) {
      const hub = hubSlugs.find((h) => to === h || to.endsWith(`/${h}`));
      if (hub) redirects[from] = `formaciones/${hub}`;
    }
  }

  const sorted = Object.fromEntries(
    Object.entries(redirects).sort(([a], [b]) => a.localeCompare(b))
  );

  writeFileSync(OUT, `${JSON.stringify(sorted, null, 2)}\n`);
  console.log(`Wrote ${Object.keys(sorted).length} redirects → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
