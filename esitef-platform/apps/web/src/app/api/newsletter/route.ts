import { NextResponse } from "next/server";
import { z } from "zod";
import { saveNewsletterSubscriber } from "@/lib/newsletter-subscribe";
import { sendNewsletterWelcomeEmail } from "@/lib/newsletter-welcome-mail";

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
  console.info("[newsletter]", { email, source });

  try {
    await saveNewsletterSubscriber(email, source);
  } catch (err) {
    console.error("[newsletter:db]", err);
    return { ok: false as const, error: "db_failed" };
  }

  const welcome = await sendNewsletterWelcomeEmail(email);
  if (!welcome.ok) {
    console.error("[newsletter] welcome email failed", welcome.error);
    return { ok: false as const, error: welcome.error ?? "mail_failed" };
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
