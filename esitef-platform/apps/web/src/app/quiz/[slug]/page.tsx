import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { QuizForm } from "@/components/QuizForm";
import { courses, quizQuestions, quizzes } from "@esitef/db";
import { getDb } from "@/lib/db";
import { userHasEnrollment } from "@/lib/lms";

export default async function QuizPage({
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

  const [quiz] = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.courseId, course.id))
    .limit(1);

  if (!quiz) {
    return (
      <div className="container" style={{ padding: "2rem 0" }}>
        <p>Este curso no tiene quiz configurado.</p>
      </div>
    );
  }

  const questions = await db
    .select()
    .from(quizQuestions)
    .where(eq(quizQuestions.quizId, quiz.id))
    .orderBy(quizQuestions.sortOrder);

  return (
    <div className="container" style={{ padding: "2rem 0" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", marginBottom: "1rem" }}>
        Quiz: {quiz.title}
      </h1>
      <QuizForm quizId={quiz.id} courseSlug={slug} questions={questions} passingScore={quiz.passingScore} />
    </div>
  );
}
