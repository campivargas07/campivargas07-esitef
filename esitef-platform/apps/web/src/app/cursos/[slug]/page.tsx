import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { CheckoutButtons } from "@/components/CheckoutButtons";
import {
  getCourseBySlug,
  getCourseCurriculum,
  userHasEnrollment,
} from "@/lib/lms";

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const session = await auth();
  const enrolled = session?.user?.id
    ? await userHasEnrollment(session.user.id, course.id)
    : false;
  const curriculum = await getCourseCurriculum(course.id);

  return (
    <div className="container">
      <section className="hero">
        <div className="shell">
          <div className="card">
            <h1>{course.title}</h1>
            <p>{course.excerpt}</p>
            <p className="price">{formatPrice(course.priceCents, course.currency)}</p>
            {enrolled ? (
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <Link href={`/aprender/${course.slug}`} className="btn btn-primary">
                  Continuar curso
                </Link>
                <Link href={`/certificados/${course.slug}`} className="btn btn-outline">
                  Ver certificado
                </Link>
              </div>
            ) : session?.user ? (
              <CheckoutButtons courseSlug={course.slug} />
            ) : (
              <Link href={`/ingresar?callbackUrl=/cursos/${course.slug}`} className="btn btn-primary">
                Ingresar para comprar
              </Link>
            )}
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: "3rem" }}>
        <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "1rem" }}>
          Contenido del curso
        </h2>
        {curriculum.map((mod) => (
          <div key={mod.id} className="card" style={{ marginBottom: "1rem" }}>
            <h3>{mod.title}</h3>
            <ul style={{ marginTop: "0.75rem", paddingLeft: "1.25rem" }}>
              {mod.lessons.map((lesson) => (
                <li key={lesson.id}>{lesson.title}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
