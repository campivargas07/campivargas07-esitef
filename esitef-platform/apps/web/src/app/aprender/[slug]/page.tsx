import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { LessonPlayer } from "@/components/LessonPlayer";
import {
  getCourseBySlug,
  getCourseCurriculum,
  userHasEnrollment,
} from "@/lib/lms";

export default async function LearnPage({
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
  const firstLesson = curriculum[0]?.lessons[0];

  return (
    <div className="container" style={{ padding: "2rem 0" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", marginBottom: "1rem" }}>
        {course.title}
      </h1>
      {firstLesson ? (
        <LessonPlayer
          lessonId={firstLesson.id}
          title={firstLesson.title}
          contentHtml={firstLesson.contentHtml}
          videoUrl={firstLesson.videoUrl}
          courseSlug={slug}
        />
      ) : (
        <p>Este curso aún no tiene lecciones.</p>
      )}
    </div>
  );
}
