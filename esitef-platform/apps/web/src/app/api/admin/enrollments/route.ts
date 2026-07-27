import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/admin";
import {
  adminGrantCourseByEmail,
  adminSetEnrollmentStatus,
  findAdminUserByEmail,
  listAdminCourseOptions,
} from "@/lib/admin-enrollments";

export async function GET(req: Request) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const email = url.searchParams.get("email");

  if (email) {
    const user = await findAdminUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "No hay usuario con ese email." },
        { status: 404 }
      );
    }
    return NextResponse.json({ user });
  }

  const courses = await listAdminCourseOptions();
  return NextResponse.json({ courses });
}

const postSchema = z.object({
  email: z.string().email(),
  courseId: z.string().uuid(),
});

export async function POST(req: Request) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Email y curso válidos requeridos." },
      { status: 400 }
    );
  }

  const result = await adminGrantCourseByEmail(
    parsed.data.email,
    parsed.data.courseId
  );
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const messages = {
    created: "Curso asignado.",
    already_active: "El usuario ya tenía acceso activo a ese curso.",
    reactivated: "Acceso reactivado.",
  } as const;

  return NextResponse.json({
    result: result.result,
    message: messages[result.result],
    user: result.user,
  });
}

const patchSchema = z.object({
  enrollmentId: z.string().uuid(),
  status: z.enum(["active", "cancelled"]),
});

export async function PATCH(req: Request) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const result = await adminSetEnrollmentStatus(
    parsed.data.enrollmentId,
    parsed.data.status
  );
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ ok: true, status: parsed.data.status });
}
