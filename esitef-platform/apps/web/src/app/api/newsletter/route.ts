import { NextResponse } from "next/server";
import { z } from "zod";
import { sendMail } from "@/lib/mail";
import { saveNewsletterSubscriber } from "@/lib/newsletter-subscribe";

const newsletterSchema = z.object({
  email: z.string().trim().email().max(254),
});

function redirectBack(req: Request, code: "ok" | "invalid" | "error") {
  const referer = req.headers.get("referer");
  const base = referer ? new URL(referer) : new URL("/", req.url);
  base.searchParams.set("newsletter", code);
  return NextResponse.redirect(base, 303);
}

async function subscribe(email: string, source = "footer") {
  const teamTo =
    process.env.NEWSLETTER_EMAIL?.trim() ||
    process.env.CONTACT_EMAIL?.trim() ||
    "info@esitef.com";

  console.info("[newsletter]", { teamTo, email, source });

  try {
    await saveNewsletterSubscriber(email, source);
  } catch (err) {
    console.error("[newsletter:db]", err);
    return { ok: false as const, error: "db_failed" };
  }

  const welcome = await sendMail({
    to: email,
    subject: "Bienvenido al newsletter de ESITEF",
    text: [
      "Gracias por suscribirte al newsletter de ESITEF.",
      "",
      "Pronto recibirás novedades sobre formaciones, contenidos y eventos.",
      "",
      "— Equipo ESITEF",
    ].join("\n"),
    html: `
      <p>Gracias por suscribirte al newsletter de ESITEF.</p>
      <p>Pronto recibirás novedades sobre formaciones, contenidos y eventos.</p>
      <p>— Equipo ESITEF</p>
    `.trim(),
  });

  if (!welcome.ok) {
    return { ok: false as const, error: welcome.error ?? "mail_failed" };
  }

  const team = await sendMail({
    to: teamTo,
    subject: `Nueva suscripción newsletter: ${email}`,
    text: `Nueva suscripción al newsletter desde el footer.\n\nEmail: ${email}`,
    html: `<p>Nueva suscripción al newsletter desde el footer.</p><p><strong>Email:</strong> ${email}</p>`,
  });

  if (!team.ok) {
    console.error("[newsletter] team notification failed", team.error);
  }

  return { ok: true as const };
}

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  const wantsJson = contentType.includes("application/json");

  let emailInput: unknown;
  if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
    const form = await req.formData();
    emailInput = form.get("email");
  } else {
    const body = await req.json().catch(() => null);
    emailInput = body?.email;
  }

  const parsed = newsletterSchema.safeParse({ email: emailInput });
  if (!parsed.success) {
    return wantsJson
      ? NextResponse.json({ error: "invalid_email" }, { status: 400 })
      : redirectBack(req, "invalid");
  }

  const result = await subscribe(parsed.data.email, "footer");
  if (!result.ok) {
    return wantsJson
      ? NextResponse.json({ error: result.error }, { status: 502 })
      : redirectBack(req, "error");
  }

  return wantsJson ? NextResponse.json({ ok: true }) : redirectBack(req, "ok");
}
