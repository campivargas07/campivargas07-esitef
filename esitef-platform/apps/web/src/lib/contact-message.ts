import { desc } from "drizzle-orm";
import { contactMessages } from "@esitef/db";
import { getDb } from "@/lib/db";

export type ContactMessageInput = {
  nombre: string;
  email: string;
  mensaje: string;
};

/** Persist contacto form submission in Neon. */
export async function saveContactMessage(
  input: ContactMessageInput
): Promise<void> {
  const db = getDb();
  await db.insert(contactMessages).values({
    nombre: input.nombre.trim(),
    email: input.email.trim().toLowerCase(),
    mensaje: input.mensaje.trim(),
  });
}

export async function listContactMessages(options?: { limit?: number }) {
  const db = getDb();
  const limit = options?.limit ?? 100;

  return db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt))
    .limit(limit);
}
