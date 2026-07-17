import { NextResponse } from "next/server";
import { z } from "zod";
import { sendMail } from "@/lib/mail";

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
  const to = process.env.CONTACT_EMAIL ?? "info@esitef.com";

  console.info("[contact]", { to, nombre, email, mensaje: mensaje.slice(0, 80) });

  const text = [`De: ${nombre} <${email}>`, "", mensaje].join("\n");
  const html = `<p><strong>${nombre}</strong> &lt;${email}&gt;</p><p>${mensaje.replace(/\n/g, "<br>")}</p>`;

  const sent = await sendMail({
    to,
    subject: `Contacto web: ${nombre}`,
    text,
    html,
  });

  if (!sent.ok) {
    return NextResponse.json({ error: "Mail failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
