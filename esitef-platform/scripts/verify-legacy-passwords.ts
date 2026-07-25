#!/usr/bin/env tsx
/**
 * Verifica que legacy_identities tengan hashes WP portables (sin bridge).
 * Usage: npm run verify:legacy-passwords
 */
import { count, eq, isNull } from "drizzle-orm";
import { createDb, legacyIdentities, users } from "@esitef/db";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no configurada");
  }

  const db = createDb();

  const [legacyTotal] = await db
    .select({ c: count() })
    .from(legacyIdentities);
  const [migrated] = await db
    .select({ c: count() })
    .from(users)
    .where(eq(users.passwordMigrated, true));
  const [pendingLegacy] = await db
    .select({ c: count() })
    .from(legacyIdentities)
    .where(isNull(legacyIdentities.migratedAt));

  const sample = await db
    .select({
      email: users.email,
      hash: legacyIdentities.legacyPasswordHash,
      migrated: users.passwordMigrated,
    })
    .from(legacyIdentities)
    .innerJoin(users, eq(users.id, legacyIdentities.userId))
    .limit(5);

  console.log("=== Legacy password readiness ===\n");
  console.log(`legacy_identities: ${legacyTotal?.c ?? 0}`);
  console.log(`users password_migrated: ${migrated?.c ?? 0}`);
  console.log(`legacy pending first-login rehash: ${pendingLegacy?.c ?? 0}`);

  const invalid = sample.filter(
    (row) =>
      !row.hash ||
      (!row.hash.startsWith("$P$") &&
        !row.hash.startsWith("$wp$") &&
        !row.hash.startsWith("$2") &&
        !(row.hash.length === 32 && /^[a-f0-9]+$/i.test(row.hash)))
  );

  if (invalid.length > 0) {
    console.warn("\n⚠ Muestra con hashes no estándar:", invalid.map((r) => r.email));
  } else {
    console.log("\n✓ Muestra de hashes con formato WP/bcrypt reconocible");
  }

  const bridge = process.env.WP_AUTH_BRIDGE_ENABLED;
  if (bridge === "false") {
    console.log("✓ WP_AUTH_BRIDGE_ENABLED=false — login sin WordPress");
  } else {
    console.log(
      "→ Tras smoke de login real, pon WP_AUTH_BRIDGE_ENABLED=false y retira WP_AUTH_BRIDGE_URL"
    );
  }

  console.log("\nverify:legacy-passwords PASSED");
}

main().catch((err) => {
  console.error("\nverify:legacy-passwords FAILED:", err instanceof Error ? err.message : err);
  process.exit(1);
});
