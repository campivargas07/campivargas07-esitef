/**
 * ponytail: self-check for newsletter subscriber persistence.
 * Run: npx tsx src/lib/newsletter-subscribe.check.ts
 */
import { eq } from "drizzle-orm";
import { newsletterSubscribers } from "@esitef/db";
import { getDb } from "@/lib/db";
import { saveNewsletterSubscriber } from "./newsletter-subscribe";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

async function main() {
  const testEmail = `newsletter-check-${Date.now()}@esitef.com`;

  await saveNewsletterSubscriber(testEmail, "self-check");

  const db = getDb();
  const [row] = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, testEmail))
    .limit(1);

  assert(row?.source === "self-check", "subscriber row saved");

  await db
    .delete(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, testEmail));

  console.log("newsletter-subscribe.check.ts OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
