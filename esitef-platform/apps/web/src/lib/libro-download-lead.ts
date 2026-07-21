import { desc, eq } from "drizzle-orm";
import { libroDownloadLeads } from "@esitef/db";
import { getDb } from "@/lib/db";

export type LibroDownloadLeadInput = {
  libroKey: string;
  nombre: string;
  pais: string;
  ciudad: string;
  telefono: string;
  email: string;
  edad: string;
  profesion: string;
};

/** Persist libro download form submission in Neon. */
export async function saveLibroDownloadLead(
  input: LibroDownloadLeadInput
): Promise<void> {
  const db = getDb();
  await db.insert(libroDownloadLeads).values({
    libroKey: input.libroKey,
    nombre: input.nombre.trim(),
    pais: input.pais.trim(),
    ciudad: input.ciudad.trim(),
    telefono: input.telefono.trim(),
    email: input.email.trim().toLowerCase(),
    edad: input.edad.trim(),
    profesion: input.profesion.trim(),
  });
}

export async function listLibroDownloadLeads(options?: {
  libroKey?: string;
  limit?: number;
}) {
  const db = getDb();
  const limit = options?.limit ?? 50;
  const libroKey = options?.libroKey;

  return db
    .select()
    .from(libroDownloadLeads)
    .where(libroKey ? eq(libroDownloadLeads.libroKey, libroKey) : undefined)
    .orderBy(desc(libroDownloadLeads.createdAt))
    .limit(limit);
}
