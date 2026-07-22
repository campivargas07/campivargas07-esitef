import { NextResponse } from "next/server";
import { z } from "zod";
import { escapeHtml, sendMail } from "@/lib/mail";
import {
  emailDetailBoxHtml,
  emailEyebrowHtml,
  emailHeadingHtml,
  emailParagraphHtml,
} from "@/lib/email-html-blocks";
import { wrapTransactionalEmail } from "@/lib/email-html-wrapper";

const contactSchema = z.object({
  nombre: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  mensaje: z.string().trim().min(1).max(5000),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { nombre, email, mensaje } = parsed.data;
  const to = process.env.CONTACT_EMAIL?.trim() || "info@esitef.com";

  console.info("[contact]", { to, nombre, email, mensaje: mensaje.slice(0, 80) });

  const safeNombre = escapeHtml(nombre);
  const safeEmail = escapeHtml(email);
  const safeMensaje = escapeHtml(mensaje).replace(/\n/g, "<br>");

  const text = [`De: ${nombre} <${email}>`, "", mensaje].join("\n");
  const inner = [
    emailEyebrowHtml("Contacto web"),
    emailHeadingHtml(`Mensaje de ${safeNombre}`),
    emailParagraphHtml(
      `Has recibido un nuevo mensaje desde el formulario de contacto.`
    ),
    emailDetailBoxHtml([
      { label: "Nombre", value: safeNombre },
      { label: "Email", value: safeEmail },
      { label: "Mensaje", value: safeMensaje },
    ]),
  ].join("");
  const html = wrapTransactionalEmail(inner);

  const sent = await sendMail({
    to,
    subject: `Contacto web: ${nombre}`,
    text,
    html,
  });

  if (!sent.ok) {
    return NextResponse.json(
      { error: sent.error ?? "mail_failed" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
