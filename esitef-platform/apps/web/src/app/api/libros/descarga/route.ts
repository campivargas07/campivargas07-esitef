import { NextResponse } from "next/server";
import { z } from "zod";
import { getLibroByKey, LIBRO_PROFESIONES } from "@/lib/libros";
import { saveLibroDownloadLead } from "@/lib/libro-download-lead";
import { getSignedLibroPdfUrl } from "@/lib/libro-blob-url";
import { listLibroPdfFiles } from "@/lib/libro-pdf";
import { sendLibroDescargaEmails } from "@/lib/libro-descarga-mail";

const schema = z.object({
  libroKey: z.string().min(1),
  nombre: z.string().trim().min(1).max(200),
  pais: z.string().trim().min(1).max(120),
  ciudad: z.string().trim().min(1).max(120),
  telefono: z.string().trim().min(1).max(50),
  email: z.string().trim().email().max(254),
  edad: z.string().trim().min(1).max(10),
  profesion: z.string().refine((v) =>
    (LIBRO_PROFESIONES as readonly string[]).includes(v)
  ),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const book = getLibroByKey(parsed.data.libroKey);
  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const { libroKey, ...lead } = parsed.data;

  try {
    await saveLibroDownloadLead({ libroKey, ...lead });
  } catch (err) {
    console.error("[libro-descarga] db insert failed", err);
    return NextResponse.json(
      { error: "Could not save submission" },
      { status: 500 }
    );
  }

  const files = await listLibroPdfFiles(libroKey);
  const storedPdfs = files.map((f) => ({
    pdfUrl: f.pdfUrl,
    fileName: f.fileName,
    slot: f.slot,
  }));

  const fallbackUrl = book.pdf_url || undefined;
  if (storedPdfs.length === 0 && fallbackUrl) {
    storedPdfs.push({ pdfUrl: fallbackUrl, fileName: null, slot: "1" });
  }

  const pdfs = await Promise.all(
    storedPdfs.map(async (p) => ({
      ...p,
      pdfUrl: await getSignedLibroPdfUrl(p.pdfUrl),
    }))
  );

  await sendLibroDescargaEmails(
    book,
    lead,
    pdfs.map((p) => ({ url: p.pdfUrl, fileName: p.fileName }))
  );

  const first = pdfs[0];

  return NextResponse.json({
    ok: true,
    pdfs,
    pdfUrl: first?.pdfUrl ?? null,
    fileName: first?.fileName ?? null,
  });
}
