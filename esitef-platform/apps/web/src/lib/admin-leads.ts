import { desc, isNull } from "drizzle-orm";
import { newsletterSubscribers } from "@esitef/db";
import { getDb } from "@/lib/db";
import { listContactMessages } from "@/lib/contact-message";

export function formatAdminDate(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export async function listAdminContactMessages(options?: { limit?: number }) {
  return listContactMessages(options);
}

export async function listAdminNewsletterSubscribers(options?: {
  limit?: number;
  activeOnly?: boolean;
}) {
  const db = getDb();
  const limit = options?.limit ?? 100;
  const activeOnly = options?.activeOnly ?? true;

  return db
    .select()
    .from(newsletterSubscribers)
    .where(activeOnly ? isNull(newsletterSubscribers.unsubscribedAt) : undefined)
    .orderBy(desc(newsletterSubscribers.subscribedAt))
    .limit(limit);
}
