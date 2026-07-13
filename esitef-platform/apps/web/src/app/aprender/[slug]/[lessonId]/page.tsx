import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { LearnShell } from "@/components/LearnShell";
import {
  flattenCurriculumLessons,
  getCourseBySlug,
  getCourseCurriculum,
  getUserCompletedLessonIds,
  userHasEnrollment,
} from "@/lib/lms";

export default async function LearnLessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/ingresar");

  const { slug, lessonId } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const enrolled = await userHasEnrollment(session.user.id, course.id);
  if (!enrolled) redirect(`/cursos/${slug}`);

  const curriculum = await getCourseCurriculum(course.id);
  const allLessons = flattenCurriculumLessons(curriculum);
  const lessonIndex = allLessons.findIndex((l) => l.id === lessonId);
  if (lessonIndex < 0) notFound();

  const lesson = allLessons[lessonIndex];
  const completedLessonIds = await getUserCompletedLessonIds(
    session.user.id,
    allLessons.map((l) => l.id)
  );

  return (
    <LearnShell
      courseId={course.id}
      courseTitle={course.title}
      courseSlug={slug}
      curriculum={curriculum}
      currentLessonId={lessonId}
      completedLessonIds={completedLessonIds}
      lesson={lesson}
      prevLessonId={lessonIndex > 0 ? allLessons[lessonIndex - 1].id : null}
      nextLessonId={
        lessonIndex < allLessons.length - 1
          ? allLessons[lessonIndex + 1].id
          : null
      }
    />
  );
}
