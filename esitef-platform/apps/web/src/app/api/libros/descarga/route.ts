import { NextResponse } from "next/server";
import { z } from "zod";
import { getLibroByKey, LIBRO_PROFESIONES } from "@/lib/libros";
import { saveLibroDownloadLead } from "@/lib/libro-download-lead";
import { getLibroPdfAsset } from "@/lib/libro-pdf";
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

  const asset = await getLibroPdfAsset(libroKey);
  const pdfUrl = asset?.pdfUrl || book.pdf_url || undefined;
  const fileName = asset?.fileName ?? undefined;

  await sendLibroDescargaEmails(book, lead, pdfUrl);

  return NextResponse.json({
    ok: true,
    pdfUrl: pdfUrl ?? null,
    fileName: fileName ?? null,
  });
}
