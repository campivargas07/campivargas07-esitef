#!/usr/bin/env tsx
/**
 * Backfill paid presencial orders into Google Sheet tab Presenciales.
 * Usage (from apps/web, with .env.local):
 *   npx tsx scripts/backfill-presenciales-sheet.ts
 *   npx tsx scripts/backfill-presenciales-sheet.ts --dry-run
 *   npx tsx scripts/backfill-presenciales-sheet.ts --force
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { asc, eq, sql } from "drizzle-orm";
import { createDb, orders } from "@esitef/db";
import { ensurePresencialesSheetTab } from "../src/lib/google-purchases-sheet";
import { syncPresencialOrderToSheet } from "../src/lib/notify-course-purchase";

function loadEnvLocal() {
  const path = join(import.meta.dirname, "../.env.local");
  try {
    const raw = readFileSync(path, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const i = trimmed.indexOf("=");
      if (i === -1) continue;
      const key = trimmed.slice(0, i).trim();
      let value = trimmed.slice(i + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    console.warn("No .env.local — usa variables de entorno");
  }
}

async function main() {
  loadEnvLocal();
  const dryRun = process.argv.includes("--dry-run");
  const force = process.argv.includes("--force");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL required");
  }
  if (!dryRun && !process.env.GOOGLE_PURCHASES_SHEET_ID) {
    throw new Error("GOOGLE_PURCHASES_SHEET_ID required");
  }

  const db = createDb(process.env.DATABASE_URL);
  const rows = await db
    .select({
      id: orders.id,
      paidAt: orders.paidAt,
      metadata: orders.metadata,
    })
    .from(orders)
    .where(
      sql`${orders.status} = 'paid' AND ${orders.metadata}->>'type' = 'presencial'`
    )
    .orderBy(asc(orders.paidAt));

  console.log(`Found ${rows.length} paid presencial order(s)`);

  if (!dryRun) {
    const tabOk = await ensurePresencialesSheetTab();
    if (!tabOk.ok) {
      throw new Error(`Could not create Presenciales tab: ${tabOk.error}`);
    }
    console.log("Presenciales tab ready");
  }

  let synced = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows) {
    const meta = (row.metadata ?? {}) as { purchaseSheetAppendedAt?: string };
    const already = Boolean(meta.purchaseSheetAppendedAt);
    if (already && !force) {
      skipped++;
      continue;
    }

    if (dryRun) {
      console.log(`[dry-run] would sync ${row.id} (paid ${row.paidAt?.toISOString() ?? "?"})`);
      synced++;
      continue;
    }

    if (force && already) {
      console.log(`[force] re-sync ${row.id}`);
    }

    const ok = await syncPresencialOrderToSheet(row.id, { force });
    if (ok) {
      synced++;
      console.log(`Synced ${row.id}`);
    } else {
      failed++;
      console.warn(`Failed ${row.id}`);
    }
  }

  console.log(
    `Done: synced=${synced} skipped=${skipped} failed=${failed}${dryRun ? " (dry-run)" : ""}`
  );
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
