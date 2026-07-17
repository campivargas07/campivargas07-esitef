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

/** Notify team + optional download link to user. Failures are logged; caller still returns PDF. */
export async function sendLibroDescargaEmails(
  book: Libro,
  lead: LibroLead,
  pdfUrl?: string
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

  if (!pdfUrl) return;

  const userText = [
    `Hola ${lead.nombre},`,
    "",
    `Gracias por descargar "${book.title}".`,
    `Enlace: ${pdfUrl}`,
    "",
    "ESITEF",
  ].join("\n");

  const userHtml = `
    <p>Hola ${lead.nombre},</p>
    <p>Gracias por descargar <strong>${book.title}</strong>.</p>
    <p><a href="${pdfUrl}">Descargar el libro</a></p>
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
