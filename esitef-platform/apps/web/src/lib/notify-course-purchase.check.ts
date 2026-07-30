/**
 * ponytail: notify-course-purchase helpers smoke test (no DB/API).
 * Run: npx tsx src/lib/notify-course-purchase.check.ts
 */
import {
  isGooglePurchasesSheetConfigured,
} from "@/lib/google-purchases-sheet";
import { isChatwootConfigured } from "@/lib/chatwoot-contacts";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function main() {
  assert(
    isGooglePurchasesSheetConfigured() === false,
    "sheet not configured without env"
  );
  assert(
    isChatwootConfigured() === false,
    "chatwoot not configured without env"
  );

  const presencialesRange =
    process.env.GOOGLE_PRESENCIALES_SHEET_RANGE?.trim() ||
    "Presenciales!A:I";
  assert(
    presencialesRange.startsWith("Presenciales!"),
    "default presenciales sheet range"
  );

  console.log("notify-course-purchase.check.ts OK");
}

main();
