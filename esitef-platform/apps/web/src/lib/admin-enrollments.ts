import { and, asc, desc, eq, sql } from "drizzle-orm";
import { courses, enrollments, users } from "@esitef/db";
import { getDb } from "@/lib/db";
import { grantEnrollmentToUser } from "@/lib/lms";

export type AdminCourseOption = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
};

export type AdminUserEnrollment = {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  status: "active" | "expired" | "cancelled";
  enrolledAt: string;
};

export type AdminEnrollmentUser = {
  id: string;
  email: string;
  name: string | null;
  enrollments: AdminUserEnrollment[];
};

export async function listAdminCourseOptions(): Promise<AdminCourseOption[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      published: courses.published,
    })
    .from(courses)
    .orderBy(asc(courses.title));
  return rows;
}

export async function findAdminUserByEmail(
  emailRaw: string
): Promise<AdminEnrollmentUser | null> {
  const email = emailRaw.trim().toLowerCase();
  if (!email || !email.includes("@")) return null;

  const db = getDb();
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
    })
    .from(users)
    .where(sql`lower(${users.email}) = ${email}`)
    .limit(1);

  if (!user) return null;

  const rows = await db
    .select({
      enrollmentId: enrollments.id,
      courseId: enrollments.courseId,
      status: enrollments.status,
      enrolledAt: enrollments.enrolledAt,
      courseTitle: courses.title,
      courseSlug: courses.slug,
    })
    .from(enrollments)
    .innerJoin(courses, eq(courses.id, enrollments.courseId))
    .where(eq(enrollments.userId, user.id))
    .orderBy(desc(enrollments.enrolledAt));

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    enrollments: rows.map((r) => ({
      enrollmentId: r.enrollmentId,
      courseId: r.courseId,
      courseTitle: r.courseTitle,
      courseSlug: r.courseSlug,
      status: r.status,
      enrolledAt: r.enrolledAt.toISOString(),
    })),
  };
}

export async function adminGrantCourseByEmail(
  emailRaw: string,
  courseId: string
): Promise<
  | { ok: true; result: "created" | "already_active" | "reactivated"; user: AdminEnrollmentUser }
  | { ok: false; error: string }
> {
  const email = emailRaw.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Email inválido." };
  }
  if (!courseId) {
    return { ok: false, error: "Selecciona un curso." };
  }

  const db = getDb();
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`lower(${users.email}) = ${email}`)
    .limit(1);

  if (!user) {
    return { ok: false, error: "No hay usuario con ese email." };
  }

  const [course] = await db
    .select({ id: courses.id })
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);

  if (!course) {
    return { ok: false, error: "Curso no encontrado." };
  }

  const result = await grantEnrollmentToUser(user.id, courseId);
  const refreshed = await findAdminUserByEmail(email);
  if (!refreshed) {
    return { ok: false, error: "Usuario no encontrado tras asignar." };
  }
  return { ok: true, result, user: refreshed };
}

export async function adminSetEnrollmentStatus(
  enrollmentId: string,
  status: "active" | "cancelled"
): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = getDb();
  const [row] = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(eq(enrollments.id, enrollmentId))
    .limit(1);
  if (!row) return { ok: false, error: "Matrícula no encontrada." };

  await db
    .update(enrollments)
    .set({
      status,
      expiresAt: status === "cancelled" ? new Date() : null,
    })
    .where(and(eq(enrollments.id, enrollmentId)));

  return { ok: true };
}
