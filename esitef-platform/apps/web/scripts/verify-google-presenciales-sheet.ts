#!/usr/bin/env tsx
/**
 * Diagnóstico: pestaña Presenciales + append de prueba.
 * Usage: npm run verify:presenciales-sheet
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  appendPresencialRow,
  ensurePresencialesSheetTab,
  isGooglePurchasesSheetConfigured,
} from "../src/lib/google-purchases-sheet";

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

  console.log(
    "GOOGLE_PURCHASES_SHEET_ID:",
    process.env.GOOGLE_PURCHASES_SHEET_ID ? "set" : "MISSING"
  );
  console.log(
    "GOOGLE_PRESENCIALES_SHEET_RANGE:",
    process.env.GOOGLE_PRESENCIALES_SHEET_RANGE?.trim() ||
      "(default Presenciales!A:I)"
  );
  console.log(
    "GOOGLE_SERVICE_ACCOUNT_JSON:",
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON ? "set" : "MISSING"
  );
  console.log("configured:", isGooglePurchasesSheetConfigured());

  if (!isGooglePurchasesSheetConfigured()) {
    process.exit(1);
  }

  const ensured = await ensurePresencialesSheetTab();
  console.log("ensurePresencialesSheetTab:", ensured);
  if (!ensured.ok) {
    process.exit(1);
  }

  if (process.env.VERIFY_PRESENCIALES_APPEND === "1") {
    const ok = await appendPresencialRow([
      new Date().toISOString(),
      "verify-test",
      "Fila de prueba verify-google-presenciales-sheet",
      "0",
      "EUR",
      "test",
      "test@esitef.com",
      "Verify Script",
      "https://app.esitef.com/admin/orders",
    ]);
    console.log("append test row:", ok ? "OK" : "FAILED");
    if (!ok) process.exit(1);
  } else {
    console.log("Tip: VERIFY_PRESENCIALES_APPEND=1 para añadir fila de prueba");
  }

  console.log("verify-google-presenciales-sheet OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
