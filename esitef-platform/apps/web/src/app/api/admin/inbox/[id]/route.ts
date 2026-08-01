import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/admin";
import {
  adminCloseConversation,
  adminReplyToConversation,
} from "@/lib/support-inbox";

const replySchema = z.object({
  body: z.string().min(1).max(8000),
});

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = replySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const result = await adminReplyToConversation({
    conversationId: id,
    body: parsed.data.body,
    assigneeUserId: session.user?.id ?? null,
  });

  if (!result.ok) {
    const status = result.error === "not_found" ? 404 : 422;
    return NextResponse.json({ error: result.error }, { status });
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const json = (await req.json().catch(() => null)) as { status?: string } | null;
  if (json?.status === "closed") {
    await adminCloseConversation(id);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "invalid_status" }, { status: 400 });
}
