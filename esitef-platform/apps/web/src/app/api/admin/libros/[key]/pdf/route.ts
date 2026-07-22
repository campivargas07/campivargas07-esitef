import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/admin";
import { getLibroByKey } from "@/lib/libros";
import { upsertLibroPdfAsset } from "@/lib/libro-pdf";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await params;
  const book = getLibroByKey(key);
  if (!book) {
    return NextResponse.json({ error: "Libro no encontrado." }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const slot = String(formData.get("slot") ?? "1");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo requerido." }, { status: 400 });
  }

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Solo se permiten PDF." }, { status: 400 });
  }

  const safeName = file.name.replace(/[^\w.\-() ]+/g, "_");
  const pathname = `libros/${key}/${slot}-${Date.now()}-${safeName}`;

  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    console.error("[admin/libros/pdf] BLOB_READ_WRITE_TOKEN missing");
    return NextResponse.json(
      {
        error:
          "Falta BLOB_READ_WRITE_TOKEN en Vercel. Storage → Blob → conectar al proyecto → redeploy.",
      },
      { status: 503 }
    );
  }

  try {
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
      token,
    });

    await upsertLibroPdfAsset({
      libroKey: key,
      slot,
      pdfUrl: blob.url,
      fileName: file.name,
    });

    return NextResponse.json({
      ok: true,
      pdfUrl: blob.url,
      fileName: file.name,
    });
  } catch (err) {
    console.error("[admin/libros/pdf] upload failed", err);
    return NextResponse.json(
      { error: "No se pudo subir el PDF. Revisa BLOB_READ_WRITE_TOKEN." },
      { status: 500 }
    );
  }
}
