/**
 * Self-check: Turnstile skips when secret unset; fails closed when set + empty token.
 * Run: npx tsx src/lib/turnstile.check.ts
 */
import { verifyTurnstile } from "./turnstile";

async function main() {
  const prev = process.env.TURNSTILE_SECRET_KEY;
  delete process.env.TURNSTILE_SECRET_KEY;
  const open = await verifyTurnstile(undefined);
  if (!open) throw new Error("expected skip when secret unset");

  process.env.TURNSTILE_SECRET_KEY = "test-secret-not-real";
  const closed = await verifyTurnstile("");
  if (closed) throw new Error("expected fail when secret set and token empty");

  if (prev) process.env.TURNSTILE_SECRET_KEY = prev;
  else delete process.env.TURNSTILE_SECRET_KEY;

  console.log("turnstile.check OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
