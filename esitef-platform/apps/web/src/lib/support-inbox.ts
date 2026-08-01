import { and, desc, eq, inArray, ne } from "drizzle-orm";
import {
  supportConversations,
  supportMessages,
} from "@esitef/db";
import { getDb } from "@/lib/db";
import { escapeHtml, sendMail } from "@/lib/mail";
import {
  decideSupportReply,
  type AgentMessage,
} from "@/lib/support-agent";

function supportFrom(): string {
  return (
    process.env.SUPPORT_MAIL_FROM?.trim() ||
    process.env.MAIL_FROM?.trim() ||
    "ESITEF <info@esitef.com>"
  );
}

function notifyEmail(): string {
  return (
    process.env.SUPPORT_NOTIFY_EMAIL?.trim() ||
    process.env.CONTACT_EMAIL?.trim() ||
    "info@esitef.com"
  );
}

function extractEmail(from: string): string {
  const m = from.match(/<([^>]+)>/);
  return (m?.[1] ?? from).trim().toLowerCase();
}

function isOurAddress(email: string): boolean {
  const ours = new Set(
    [
      process.env.MAIL_FROM,
      process.env.SUPPORT_MAIL_FROM,
      process.env.CONTACT_EMAIL,
      "noreply@esitef.com",
      "info@esitef.com",
    ]
      .filter(Boolean)
      .map((v) => extractEmail(String(v)))
  );
  return ours.has(email.toLowerCase());
}

function replySubject(subject: string | null | undefined): string {
  const s = (subject ?? "").trim() || "Consulta ESITEF";
  return /^re:/i.test(s) ? s : `Re: ${s}`;
}

export async function findOpenEmailConversation(contactEmail: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(supportConversations)
    .where(
      and(
        eq(supportConversations.channel, "email"),
        eq(supportConversations.contactEmail, contactEmail.toLowerCase()),
        inArray(supportConversations.status, ["bot", "needs_human"])
      )
    )
    .orderBy(desc(supportConversations.lastMessageAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function listSupportConversations(options?: {
  status?: "bot" | "needs_human" | "closed" | "open";
  limit?: number;
}) {
  const db = getDb();
  const limit = options?.limit ?? 50;
  const status = options?.status;

  if (status === "open") {
    return db
      .select()
      .from(supportConversations)
      .where(ne(supportConversations.status, "closed"))
      .orderBy(desc(supportConversations.lastMessageAt))
      .limit(limit);
  }
  if (status === "bot" || status === "needs_human" || status === "closed") {
    return db
      .select()
      .from(supportConversations)
      .where(eq(supportConversations.status, status))
      .orderBy(desc(supportConversations.lastMessageAt))
      .limit(limit);
  }
  return db
    .select()
    .from(supportConversations)
    .orderBy(desc(supportConversations.lastMessageAt))
    .limit(limit);
}

export async function getSupportConversation(id: string) {
  const db = getDb();
  const [conv] = await db
    .select()
    .from(supportConversations)
    .where(eq(supportConversations.id, id))
    .limit(1);
  if (!conv) return null;
  const messages = await db
    .select()
    .from(supportMessages)
    .where(eq(supportMessages.conversationId, id))
    .orderBy(supportMessages.createdAt);
  return { conversation: conv, messages };
}

async function loadHistory(conversationId: string): Promise<AgentMessage[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(supportMessages)
    .where(eq(supportMessages.conversationId, conversationId))
    .orderBy(supportMessages.createdAt)
    .limit(40);
  return rows.map((m) => ({
    role: m.direction === "in" ? "user" : "assistant",
    content: m.body,
  }));
}

async function notifyHuman(input: {
  conversationId: string;
  contactEmail: string;
  subject: string | null;
  reason: string;
  snippet: string;
}) {
  const adminUrl = `${process.env.AUTH_URL?.replace(/\/$/, "") || "https://esitef.com"}/admin/inbox/${input.conversationId}`;
  const text = `Conversación escalada a humano.\nMotivo: ${input.reason}\nDe: ${input.contactEmail}\nAsunto: ${input.subject ?? "(sin asunto)"}\n\n${input.snippet.slice(0, 500)}\n\nAbrir: ${adminUrl}`;
  await sendMail({
    to: notifyEmail(),
    subject: `[ESITEF soporte] Escala: ${input.subject ?? input.contactEmail}`,
    text,
    html: `<p>${escapeHtml(text).replace(/\n/g, "<br/>")}</p>`,
  });
}

async function sendEmailReply(input: {
  to: string;
  subject: string | null;
  body: string;
  inReplyTo?: string | null;
}) {
  const headers: Record<string, string> = {};
  if (input.inReplyTo) {
    headers["In-Reply-To"] = input.inReplyTo;
    headers.References = input.inReplyTo;
  }
  return sendMail({
    to: input.to,
    from: supportFrom(),
    subject: replySubject(input.subject),
    text: input.body,
    html: `<p>${escapeHtml(input.body).replace(/\n/g, "<br/>")}</p>`,
    headers: Object.keys(headers).length ? headers : undefined,
  });
}

/**
 * Process one inbound email (after Resend receiving.get).
 * Idempotent on providerMessageId (= Resend email_id).
 */
export async function processInboundEmail(input: {
  providerEmailId: string;
  from: string;
  subject: string;
  text: string | null;
  html: string | null;
  rfcMessageId?: string | null;
}): Promise<{ ok: true; conversationId: string; skipped?: string } | { ok: false; error: string }> {
  const contactEmail = extractEmail(input.from);
  if (!contactEmail || !contactEmail.includes("@")) {
    return { ok: false, error: "invalid_from" };
  }
  if (isOurAddress(contactEmail)) {
    return { ok: true, conversationId: "", skipped: "loop_guard" };
  }

  const body =
    (input.text?.trim() ||
      input.html?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ||
      "").slice(0, 8000);
  if (!body) {
    return { ok: false, error: "empty_body" };
  }

  const db = getDb();

  // Idempotency: provider message already stored
  const existing = await db
    .select({ id: supportMessages.id, conversationId: supportMessages.conversationId })
    .from(supportMessages)
    .where(eq(supportMessages.providerMessageId, input.providerEmailId))
    .limit(1);
  if (existing[0]) {
    return {
      ok: true,
      conversationId: existing[0].conversationId,
      skipped: "duplicate",
    };
  }

  let conv = await findOpenEmailConversation(contactEmail);
  const now = new Date();

  if (!conv) {
    const [created] = await db
      .insert(supportConversations)
      .values({
        channel: "email",
        status: "bot",
        contactEmail,
        contactName: input.from.replace(/<[^>]+>/, "").trim() || null,
        subject: input.subject || null,
        lastMessageAt: now,
        updatedAt: now,
      })
      .returning();
    conv = created;
  } else {
    await db
      .update(supportConversations)
      .set({
        lastMessageAt: now,
        updatedAt: now,
        subject: conv.subject || input.subject || null,
      })
      .where(eq(supportConversations.id, conv.id));
  }

  try {
    await db.insert(supportMessages).values({
      conversationId: conv.id,
      direction: "in",
      body,
      fromBot: false,
      providerMessageId: input.providerEmailId,
      rfcMessageId: input.rfcMessageId ?? null,
    });
  } catch (err) {
    // unique race
    const msg = err instanceof Error ? err.message : String(err);
    if (/unique|duplicate/i.test(msg)) {
      return { ok: true, conversationId: conv.id, skipped: "duplicate" };
    }
    throw err;
  }

  // Human owns the thread — bot stays silent
  if (conv.status === "needs_human") {
    return { ok: true, conversationId: conv.id, skipped: "needs_human" };
  }

  const history = await loadHistory(conv.id);
  const decision = await decideSupportReply({
    history,
    latestUserText: body,
  });

  if (decision.action === "escalate") {
    await db
      .update(supportConversations)
      .set({
        status: "needs_human",
        escalateReason: decision.reason,
        updatedAt: new Date(),
      })
      .where(eq(supportConversations.id, conv.id));

    await notifyHuman({
      conversationId: conv.id,
      contactEmail,
      subject: conv.subject || input.subject,
      reason: decision.reason,
      snippet: body,
    });

    // Ack so the user isn't left hanging
    const ack =
      "Gracias por tu mensaje. Lo estamos revisando y una persona del equipo de ESITEF te responderá en breve.";
    const sent = await sendEmailReply({
      to: contactEmail,
      subject: conv.subject || input.subject,
      body: ack,
      inReplyTo: input.rfcMessageId,
    });
    if (sent.ok) {
      await db.insert(supportMessages).values({
        conversationId: conv.id,
        direction: "out",
        body: ack,
        fromBot: true,
        providerMessageId: sent.id ?? null,
        rfcMessageId: null,
      });
    }
    return { ok: true, conversationId: conv.id };
  }

  const sent = await sendEmailReply({
    to: contactEmail,
    subject: conv.subject || input.subject,
    body: decision.text,
    inReplyTo: input.rfcMessageId,
  });
  if (!sent.ok) {
    await db
      .update(supportConversations)
      .set({
        status: "needs_human",
        escalateReason: `send_failed:${sent.error}`,
        updatedAt: new Date(),
      })
      .where(eq(supportConversations.id, conv.id));
    await notifyHuman({
      conversationId: conv.id,
      contactEmail,
      subject: conv.subject || input.subject,
      reason: `send_failed:${sent.error}`,
      snippet: body,
    });
    return { ok: true, conversationId: conv.id };
  }

  await db.insert(supportMessages).values({
    conversationId: conv.id,
    direction: "out",
    body: decision.text,
    fromBot: true,
    providerMessageId: sent.id ?? null,
    rfcMessageId: null,
  });

  return { ok: true, conversationId: conv.id };
}

export async function adminReplyToConversation(input: {
  conversationId: string;
  body: string;
  assigneeUserId?: string | null;
}) {
  const text = input.body.trim();
  if (!text) return { ok: false as const, error: "empty" };

  const packed = await getSupportConversation(input.conversationId);
  if (!packed) return { ok: false as const, error: "not_found" };
  const { conversation } = packed;
  if (conversation.channel !== "email" || !conversation.contactEmail) {
    return { ok: false as const, error: "unsupported_channel" };
  }

  const lastIn = [...packed.messages]
    .reverse()
    .find((m) => m.direction === "in");

  const sent = await sendEmailReply({
    to: conversation.contactEmail,
    subject: conversation.subject,
    body: text,
    inReplyTo: lastIn?.rfcMessageId,
  });
  if (!sent.ok) return { ok: false as const, error: sent.error ?? "send_failed" };

  const db = getDb();
  await db.insert(supportMessages).values({
    conversationId: conversation.id,
    direction: "out",
    body: text,
    fromBot: false,
    providerMessageId: sent.id ?? null,
  });
  await db
    .update(supportConversations)
    .set({
      status: "needs_human",
      assigneeUserId: input.assigneeUserId ?? conversation.assigneeUserId,
      lastMessageAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(supportConversations.id, conversation.id));

  return { ok: true as const };
}

export async function adminCloseConversation(conversationId: string) {
  const db = getDb();
  await db
    .update(supportConversations)
    .set({ status: "closed", updatedAt: new Date() })
    .where(eq(supportConversations.id, conversationId));
}
