/**
 * ponytail: chatwoot-contacts smoke test (no network).
 * Run: npx tsx src/lib/chatwoot-contacts.check.ts
 */
import { isChatwootConfigured } from "@/lib/chatwoot-contacts";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function main() {
  assert(
    isChatwootConfigured() === false,
    "chatwoot not configured without env"
  );

  console.log("chatwoot-contacts.check.ts OK");
}

main();
