import { getLibros, getLibroPdfSlotCount, getLibroPdfSlotIds } from "@/lib/libros";
import { listLibroPdfFilesByKeys } from "@/lib/libro-pdf";
import { listLibroDownloadLeads } from "@/lib/libro-download-lead";

export type AdminLibroSlot = {
  slot: string;
  hasPdf: boolean;
  fileName: string | null;
  uploadedAt: Date | null;
};

export type AdminLibroRow = {
  key: string;
  title: string;
  formPath: string;
  slotCount: number;
  slots: AdminLibroSlot[];
  hasPdf: boolean;
};

export async function listAdminLibros(): Promise<AdminLibroRow[]> {
  const libros = getLibros();
  const assetsByKey = await listLibroPdfFilesByKeys(libros.map((b) => b.key));

  return libros.map((book) => {
    const uploaded = new Map(
      (assetsByKey.get(book.key) ?? []).map((a) => [a.slot, a])
    );
    const slotIds = getLibroPdfSlotIds(book);
    const slots = slotIds.map((slot) => {
      const asset = uploaded.get(slot);
      return {
        slot,
        hasPdf: Boolean(asset?.pdfUrl || (slot === "1" && book.pdf_url)),
        fileName: asset?.fileName ?? null,
        uploadedAt: asset?.uploadedAt ?? null,
      };
    });

    return {
      key: book.key,
      title: book.title,
      formPath: book.form_path,
      slotCount: getLibroPdfSlotCount(book),
      slots,
      hasPdf: slots.every((s) => s.hasPdf),
    };
  });
}

export async function listAdminLibroLeads(options?: {
  libroKey?: string;
  limit?: number;
}) {
  const leads = await listLibroDownloadLeads(options);
  const libros = getLibros();
  const titleByKey = new Map(libros.map((b) => [b.key, b.title]));

  return leads.map((lead) => ({
    ...lead,
    libroTitle: titleByKey.get(lead.libroKey) ?? lead.libroKey,
  }));
}

export function formatAdminLibroDate(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
