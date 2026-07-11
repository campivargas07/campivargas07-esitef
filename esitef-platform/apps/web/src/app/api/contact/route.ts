import { NextResponse } from "next/server";
import { z } from "zod";

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

  // Hook for future SMTP/Resend integration; log in development.
  console.info("[contact]", { to, nombre, email, mensaje: mensaje.slice(0, 80) });

  return NextResponse.json({ ok: true });
}
