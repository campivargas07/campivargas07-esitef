import { sql } from "drizzle-orm";
import { newsletterSubscribers } from "@esitef/db";
import { getDb } from "@/lib/db";

/** Persist footer/API newsletter signups in Neon. */
export async function saveNewsletterSubscriber(
  email: string,
  source = "footer"
): Promise<void> {
  const normalized = email.trim().toLowerCase();
  const db = getDb();

  await db
    .insert(newsletterSubscribers)
    .values({ email: normalized, source })
    .onConflictDoUpdate({
      target: newsletterSubscribers.email,
      set: {
        source,
        subscribedAt: sql`now()`,
        unsubscribedAt: null,
      },
    });
}
