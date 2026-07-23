/**
 * ponytail: consent helpers must gate analytics without throwing.
 * Run: npx tsx src/lib/analytics-consent.check.ts
 */
import {
  parseAnalyticsConsent,
  type AnalyticsConsent,
} from "./analytics-consent";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const cases: Array<[string | null | undefined, AnalyticsConsent | null]> = [
  ["granted", "granted"],
  ["denied", "denied"],
  [null, null],
  [undefined, null],
  ["", null],
  ["yes", null],
];

for (const [input, expected] of cases) {
  assert(
    parseAnalyticsConsent(input) === expected,
    `parseAnalyticsConsent(${String(input)}) should be ${String(expected)}`
  );
}

console.log("analytics-consent.check.ts OK");
