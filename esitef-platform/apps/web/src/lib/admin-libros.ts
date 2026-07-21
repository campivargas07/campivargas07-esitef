import { getLibros } from "@/lib/libros";
import { getLibroPdfAssetsByKeys } from "@/lib/libro-pdf";
import { listLibroDownloadLeads } from "@/lib/libro-download-lead";

export type AdminLibroRow = {
  key: string;
  title: string;
  formPath: string;
  hasPdf: boolean;
  pdfUrl: string | null;
  fileName: string | null;
  uploadedAt: Date | null;
};

export async function listAdminLibros(): Promise<AdminLibroRow[]> {
  const libros = getLibros();
  const assets = await getLibroPdfAssetsByKeys(libros.map((b) => b.key));

  return libros.map((book) => {
    const asset = assets.get(book.key);
    return {
      key: book.key,
      title: book.title,
      formPath: book.form_path,
      hasPdf: Boolean(asset?.pdfUrl || book.pdf_url),
      pdfUrl: asset?.pdfUrl ?? book.pdf_url ?? null,
      fileName: asset?.fileName ?? null,
      uploadedAt: asset?.uploadedAt ?? null,
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
