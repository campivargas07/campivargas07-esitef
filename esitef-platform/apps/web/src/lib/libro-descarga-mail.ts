import { sendMail } from "@/lib/mail";
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

function leadLines(book: Libro, lead: LibroLead) {
  return [
    `Libro: ${book.title}`,
    `Nombre: ${lead.nombre}`,
    `País: ${lead.pais}`,
    `Ciudad: ${lead.ciudad}`,
    `Teléfono: ${lead.telefono}`,
    `Email: ${lead.email}`,
    `Edad: ${lead.edad}`,
    `Profesión: ${lead.profesion}`,
  ];
}

/** Notify team + optional download links to user. Failures are logged; caller still returns PDFs. */
export async function sendLibroDescargaEmails(
  book: Libro,
  lead: LibroLead,
  pdfs: LibroPdfLink[] = []
): Promise<void> {
  const lines = leadLines(book, lead);
  const text = lines.join("\n");
  const html = lines.map((l) => `<p>${l}</p>`).join("");

  const teamTo =
    process.env.LIBRO_LEAD_EMAIL?.trim() ||
    process.env.CONTACT_EMAIL?.trim() ||
    "info@esitef.com";

  const team = await sendMail({
    to: teamTo,
    subject: `Descarga libro: ${book.title}`,
    text,
    html,
  });

  if (!team.ok) {
    console.error("[libro-descarga:mail] team notification failed");
  }

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

  const userHtml = `
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
  `;

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
