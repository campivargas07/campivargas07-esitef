import { NextResponse } from "next/server";
import {
  registerErrorMessages,
  registerUser,
  type RegisterErrorCode,
} from "@/lib/auth/register";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: registerErrorMessages.missing_fields, code: "missing_fields" },
      { status: 400 }
    );
  }

  const result = await registerUser({
    firstName: String(body.firstName ?? ""),
    lastName: String(body.lastName ?? ""),
    email: String(body.email ?? ""),
    password: String(body.password ?? ""),
    passwordConfirm: String(body.passwordConfirm ?? ""),
  });

  if (!result.ok) {
    const code = result.code as RegisterErrorCode;
    const status =
      code === "email_exists" || code === "username_exists" ? 409 : 400;
    return NextResponse.json(
      { error: registerErrorMessages[code], code },
      { status }
    );
  }

  return NextResponse.json({ ok: true });
}
