import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/auth/password-reset";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { email?: string } | null;
  const email = body?.email?.trim() ?? "";

  const result = await requestPasswordReset(email);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.code },
      { status: result.code === "invalid_email" ? 400 : 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
