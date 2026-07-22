#!/usr/bin/env tsx
/**
 * Dev helper: ensure admin@esitef.com / demo1234 works (upsert, not skip).
 * Run: npx tsx scripts/reset-dev-admin.ts
 * Loads apps/web/.env.local if DATABASE_URL unset.
 */
import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { createDb, users } from "@esitef/db";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
if (!process.env.DATABASE_URL) {
  config({ path: path.join(root, "apps/web/.env.local") });
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL missing — set it or add apps/web/.env.local");
  }

  const connectionString = process.env.DATABASE_URL.replace(/^["']|["']$/g, "");
  const db = createDb(connectionString);
  const email = "admin@esitef.com";
  const passwordHash = await bcrypt.hash("demo1234", 12);

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    await db
      .update(users)
      .set({
        role: "admin",
        passwordHash,
        passwordMigrated: true,
        updatedAt: new Date(),
      })
      .where(eq(users.email, email));
    console.log("Updated admin@esitef.com → role admin, password demo1234");
    return;
  }

  await db.insert(users).values({
    email,
    name: "Admin ESITEF",
    role: "admin",
    passwordHash,
    passwordMigrated: true,
    emailVerified: new Date(),
  });
  console.log("Created admin@esitef.com / demo1234");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
