import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  flattenCurriculumLessons,
  getCourseBySlug,
  getCourseCurriculum,
  userHasEnrollment,
} from "@/lib/lms";

export default async function LearnIndexPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/ingresar");

  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const enrolled = await userHasEnrollment(session.user.id, course.id);
  if (!enrolled) redirect(`/cursos/${slug}`);

  const curriculum = await getCourseCurriculum(course.id);
  const firstLesson = flattenCurriculumLessons(curriculum)[0];

  if (!firstLesson) {
    return (
      <div className="container" style={{ padding: "2rem 0" }}>
        <h1 style={{ fontFamily: "var(--font-heading)" }}>{course.title}</h1>
        <p>Este curso aún no tiene lecciones.</p>
      </div>
    );
  }

  redirect(`/aprender/${slug}/${firstLesson.id}`);
}
