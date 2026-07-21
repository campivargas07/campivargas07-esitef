import { eq, inArray } from "drizzle-orm";
import { libroPdfAssets } from "@esitef/db";
import { getDb } from "@/lib/db";

export type LibroPdfAsset = {
  libroKey: string;
  pdfUrl: string;
  fileName: string | null;
  uploadedAt: Date;
};

/** Resolve public PDF URL for a book (Neon is source of truth). */
export async function getLibroPdfAsset(
  libroKey: string
): Promise<LibroPdfAsset | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(libroPdfAssets)
    .where(eq(libroPdfAssets.libroKey, libroKey))
    .limit(1);
  return row ?? null;
}

export async function getLibroPdfAssetsByKeys(
  keys: string[]
): Promise<Map<string, LibroPdfAsset>> {
  if (keys.length === 0) return new Map();

  const db = getDb();
  const rows = await db
    .select()
    .from(libroPdfAssets)
    .where(inArray(libroPdfAssets.libroKey, keys));

  return new Map(rows.map((row) => [row.libroKey, row]));
}

/** Upsert PDF metadata after Blob upload. */
export async function upsertLibroPdfAsset(input: {
  libroKey: string;
  pdfUrl: string;
  fileName?: string;
}): Promise<void> {
  const db = getDb();
  await db
    .insert(libroPdfAssets)
    .values({
      libroKey: input.libroKey,
      pdfUrl: input.pdfUrl,
      fileName: input.fileName ?? null,
    })
    .onConflictDoUpdate({
      target: libroPdfAssets.libroKey,
      set: {
        pdfUrl: input.pdfUrl,
        fileName: input.fileName ?? null,
        uploadedAt: new Date(),
      },
    });
}
