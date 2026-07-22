import { asc, eq, inArray } from "drizzle-orm";
import { libroPdfAssets } from "@esitef/db";
import { getDb } from "@/lib/db";

export type LibroPdfFile = {
  libroKey: string;
  slot: string;
  pdfUrl: string;
  fileName: string | null;
  uploadedAt: Date;
};

/** All PDFs for a book, ordered by slot. */
export async function listLibroPdfFiles(
  libroKey: string
): Promise<LibroPdfFile[]> {
  const db = getDb();
  return db
    .select()
    .from(libroPdfAssets)
    .where(eq(libroPdfAssets.libroKey, libroKey))
    .orderBy(asc(libroPdfAssets.libroKey), asc(libroPdfAssets.slot));
}

export async function listLibroPdfFilesByKeys(
  keys: string[]
): Promise<Map<string, LibroPdfFile[]>> {
  if (keys.length === 0) return new Map();

  const db = getDb();
  const rows = await db
    .select()
    .from(libroPdfAssets)
    .where(inArray(libroPdfAssets.libroKey, keys))
    .orderBy(asc(libroPdfAssets.libroKey), asc(libroPdfAssets.slot));

  const map = new Map<string, LibroPdfFile[]>();
  for (const row of rows) {
    const list = map.get(row.libroKey) ?? [];
    list.push(row);
    map.set(row.libroKey, list);
  }
  return map;
}

/** Upsert PDF metadata after Blob upload. */
export async function upsertLibroPdfAsset(input: {
  libroKey: string;
  slot?: string;
  pdfUrl: string;
  fileName?: string;
}): Promise<void> {
  const slot = input.slot ?? "1";
  const db = getDb();
  await db
    .insert(libroPdfAssets)
    .values({
      libroKey: input.libroKey,
      slot,
      pdfUrl: input.pdfUrl,
      fileName: input.fileName ?? null,
    })
    .onConflictDoUpdate({
      target: [libroPdfAssets.libroKey, libroPdfAssets.slot],
      set: {
        pdfUrl: input.pdfUrl,
        fileName: input.fileName ?? null,
        uploadedAt: new Date(),
      },
    });
}
