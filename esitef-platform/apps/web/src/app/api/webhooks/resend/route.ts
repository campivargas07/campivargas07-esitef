import { NextResponse } from "next/server";
import { Resend } from "resend";
import { processInboundEmail } from "@/lib/support-inbox";

export const runtime = "nodejs";

type ReceivedEvent = {
  type: string;
  data?: {
    email_id?: string;
    from?: string;
    subject?: string;
    message_id?: string;
  };
};

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key?.startsWith("re_")) return null;
  return new Resend(key);
}

export async function POST(req: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  const resend = getResend();
  if (!resend || !secret) {
    console.error("[webhooks/resend] missing RESEND_API_KEY or RESEND_WEBHOOK_SECRET");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const payload = await req.text();
  const id = req.headers.get("svix-id");
  const timestamp = req.headers.get("svix-timestamp");
  const signature = req.headers.get("svix-signature");
  if (!id || !timestamp || !signature) {
    return NextResponse.json({ error: "missing_svix_headers" }, { status: 400 });
  }

  let event: ReceivedEvent;
  try {
    event = resend.webhooks.verify({
      payload,
      headers: { id, timestamp, signature },
      webhookSecret: secret,
    }) as ReceivedEvent;
  } catch (err) {
    console.error("[webhooks/resend] verify failed", err);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  if (event.type !== "email.received") {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const emailId = event.data?.email_id;
  if (!emailId) {
    return NextResponse.json({ error: "missing_email_id" }, { status: 400 });
  }

  const { data: email, error } = await resend.emails.receiving.get(emailId);
  if (error || !email) {
    console.error("[webhooks/resend] receiving.get", error);
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }

  const result = await processInboundEmail({
    providerEmailId: emailId,
    from: email.from || event.data?.from || "",
    subject: email.subject || event.data?.subject || "",
    text: email.text ?? null,
    html: email.html ?? null,
    rfcMessageId: email.message_id || event.data?.message_id || null,
  });

  if (!result.ok) {
    console.error("[webhooks/resend] process", result.error);
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  return NextResponse.json({
    received: true,
    conversationId: result.conversationId || undefined,
    skipped: result.skipped,
  });
}
