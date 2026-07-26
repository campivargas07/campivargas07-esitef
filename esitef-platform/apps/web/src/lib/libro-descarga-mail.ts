import { sendMail } from "@/lib/mail";
import { wrapTransactionalEmail } from "@/lib/email-html-wrapper";
import type { Libro } from "@/lib/libros";

type LibroLead = {
  nombre: string;
  pais: string;
  ciudad: string;
  telefono: string;
  email: string;
  edad: string;
  profesion: string;
};

type LibroPdfLink = {
  url: string;
  fileName?: string | null;
};

/** Send PDF download links to the lead. Failures are logged; caller still returns PDFs. */
export async function sendLibroDescargaEmails(
  book: Libro,
  lead: LibroLead,
  pdfs: LibroPdfLink[] = []
): Promise<void> {
  if (pdfs.length === 0) return;

  const linkLines = pdfs.map((p, i) => {
    const label = p.fileName || `Archivo ${i + 1}`;
    return `- ${label}: ${p.url}`;
  });

  const userText = [
    `Hola ${lead.nombre},`,
    "",
    `Gracias por descargar "${book.title}".`,
    "",
    ...linkLines,
    "",
    "ESITEF",
  ].join("\n");

  const userHtml = wrapTransactionalEmail(`
    <p>Hola ${lead.nombre},</p>
    <p>Gracias por descargar <strong>${book.title}</strong>.</p>
    <ul>
      ${pdfs
        .map(
          (p, i) =>
            `<li><a href="${p.url}">${p.fileName || `Descargar PDF ${i + 1}`}</a></li>`
        )
        .join("")}
    </ul>
    <p>ESITEF</p>
  `);

  const user = await sendMail({
    to: lead.email,
    subject: `Tu descarga: ${book.title}`,
    text: userText,
    html: userHtml,
  });

  if (!user.ok) {
    console.error("[libro-descarga:mail] user confirmation failed");
  }
}
