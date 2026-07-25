import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/lib/auth/password-reset";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    token?: string;
    password?: string;
    passwordConfirm?: string;
  } | null;

  const result = await resetPasswordWithToken({
    token: body?.token ?? "",
    password: body?.password ?? "",
    passwordConfirm: body?.passwordConfirm ?? "",
  });

  if (!result.ok) {
    const status =
      result.code === "invalid_token" ||
      result.code === "expired_token" ||
      result.code === "password_mismatch" ||
      result.code === "weak_password"
        ? 400
        : 500;
    return NextResponse.json({ error: result.code }, { status });
  }

  return NextResponse.json({ ok: true });
}
