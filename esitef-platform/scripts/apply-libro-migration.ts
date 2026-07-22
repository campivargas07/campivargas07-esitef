#!/usr/bin/env tsx
/** Apply 0002_libro_downloads.sql to DATABASE_URL from apps/web/.env.local */
import { config } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
config({ path: path.join(root, "apps/web/.env.local") });

const url = process.env.DATABASE_URL?.replace(/^["']|["']$/g, "");
if (!url) throw new Error("DATABASE_URL missing");

const sqlFile = path.join(root, "packages/db/drizzle/0002_libro_downloads.sql");
const raw = fs.readFileSync(sqlFile, "utf8");
const statements = raw
  .split(/--> statement-breakpoint\n?/)
  .map((s) => s.trim())
  .filter(Boolean);

async function main() {
  const db = postgres(url, { max: 1 });
  for (const statement of statements) {
    await db.unsafe(statement);
  }
  await db.end();
  console.log("0002_libro_downloads.sql applied");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
