import { NextResponse } from "next/server";
import { z } from "zod";
import { saveNewsletterSubscriber } from "@/lib/newsletter-subscribe";
import { sendNewsletterWelcomeEmail } from "@/lib/newsletter-welcome-mail";
import { clientIp, rateLimited } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

const newsletterSchema = z.object({
  email: z.string().trim().email().max(254),
});

type RedirectCode = "ok" | "invalid" | "error" | "captcha" | "rate";

function redirectBack(req: Request, code: RedirectCode) {
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
  const ip = clientIp(req);
  const contentType = req.headers.get("content-type") ?? "";
  const wantsJson = contentType.includes("application/json");

  if (rateLimited(`newsletter:${ip}`, 5, 15 * 60_000)) {
    return wantsJson
      ? NextResponse.json({ error: "rate_limit" }, { status: 429 })
      : redirectBack(req, "rate");
  }

  let emailInput: unknown;
  let website: string | undefined;
  let turnstileToken: string | undefined;

  if (
    contentType.includes("multipart/form-data") ||
    contentType.includes("application/x-www-form-urlencoded")
  ) {
    const form = await req.formData();
    emailInput = form.get("email");
    const websiteRaw = form.get("website");
    website =
      typeof websiteRaw === "string" && websiteRaw.trim()
        ? websiteRaw.trim()
        : undefined;
    const tokenRaw = form.get("cf-turnstile-response");
    turnstileToken =
      typeof tokenRaw === "string" && tokenRaw.trim()
        ? tokenRaw.trim()
        : undefined;
  } else {
    const body = await req.json().catch(() => null);
    emailInput = body?.email;
    website =
      typeof body?.website === "string" && body.website.trim()
        ? body.website.trim()
        : undefined;
    turnstileToken =
      typeof body?.turnstileToken === "string" && body.turnstileToken.trim()
        ? body.turnstileToken.trim()
        : undefined;
  }

  if (website) {
    return wantsJson ? NextResponse.json({ ok: true }) : redirectBack(req, "ok");
  }

  const human = await verifyTurnstile(turnstileToken, ip);
  if (!human) {
    return wantsJson
      ? NextResponse.json({ error: "captcha_failed" }, { status: 403 })
      : redirectBack(req, "captcha");
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
