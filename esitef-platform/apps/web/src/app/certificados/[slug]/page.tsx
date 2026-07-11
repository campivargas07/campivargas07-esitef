import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { certificates, courses } from "@esitef/db";
import { getDb } from "@/lib/db";
import { userHasEnrollment } from "@/lib/lms";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/ingresar");

  const { slug } = await params;
  const db = getDb();
  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.slug, slug))
    .limit(1);
  if (!course) notFound();

  const enrolled = await userHasEnrollment(session.user.id, course.id);
  if (!enrolled) redirect(`/cursos/${slug}`);

  const [cert] = await db
    .select()
    .from(certificates)
    .where(
      and(
        eq(certificates.userId, session.user.id),
        eq(certificates.courseId, course.id)
      )
    )
    .limit(1);

  return (
    <div className="container" style={{ padding: "2rem 0" }}>
      <div className="shell">
        <div className="card" style={{ textAlign: "center" }}>
          <h1 style={{ fontFamily: "var(--font-heading)" }}>Certificado ESITEF</h1>
          <p style={{ margin: "1rem 0", color: "var(--color-text-muted)" }}>
            {course.title}
          </p>
          {cert ? (
            <>
              <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>{cert.certificateCode}</p>
              <p style={{ marginTop: "0.5rem", color: "var(--color-text-muted)" }}>
                Emitido el {new Date(cert.issuedAt).toLocaleDateString("es-ES")}
              </p>
            </>
          ) : (
            <p>Completa el quiz con éxito para obtener tu certificado.</p>
          )}
        </div>
      </div>
    </div>
  );
}
