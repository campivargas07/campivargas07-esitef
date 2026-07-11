import Link from "next/link";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { certificates, enrollments, courses } from "@esitef/db";
import { getDb } from "@/lib/db";
import { SignOutButton } from "@/components/SignOutButton";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/ingresar");

  const db = getDb();
  const myEnrollments = await db
    .select({
      enrolledAt: enrollments.enrolledAt,
      courseTitle: courses.title,
      courseSlug: courses.slug,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(
      and(eq(enrollments.userId, session.user.id), eq(enrollments.status, "active"))
    );

  const myCerts = await db
    .select({
      code: certificates.certificateCode,
      courseSlug: courses.slug,
      courseTitle: courses.title,
    })
    .from(certificates)
    .innerJoin(courses, eq(certificates.courseId, courses.id))
    .where(eq(certificates.userId, session.user.id));

  return (
    <div className="container">
      <section className="hero">
        <h1>Hola, {session.user.name ?? session.user.email}</h1>
        <p>Tu panel de alumno migrado desde Tutor LMS.</p>
        <SignOutButton className="btn btn-outline dashboard-signout" />
      </section>

      <div className="dashboard-grid">
        <div className="card">
          <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "1rem" }}>
            Mis cursos
          </h2>
          {myEnrollments.length === 0 ? (
            <p>No tienes matrículas activas.</p>
          ) : (
            <ul style={{ paddingLeft: "1.25rem" }}>
              {myEnrollments.map((e) => (
                <li key={e.courseSlug} style={{ marginBottom: "0.5rem" }}>
                  <Link href={`/aprender/${e.courseSlug}`}>{e.courseTitle}</Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "1rem" }}>
            Certificados
          </h2>
          {myCerts.length === 0 ? (
            <p>Aún no tienes certificados.</p>
          ) : (
            <ul style={{ paddingLeft: "1.25rem" }}>
              {myCerts.map((c) => (
                <li key={c.code} style={{ marginBottom: "0.5rem" }}>
                  <Link href={`/certificados/${c.courseSlug}`}>
                    {c.courseTitle} — {c.code}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
