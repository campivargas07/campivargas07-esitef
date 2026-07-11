import Link from "next/link";
import { LessonPlayer } from "@/components/LessonPlayer";
import type { getCourseCurriculum } from "@/lib/lms";
import "@/styles/learn.css";

type Curriculum = Awaited<ReturnType<typeof getCourseCurriculum>>;

type Props = {
  courseTitle: string;
  courseSlug: string;
  curriculum: Curriculum;
  currentLessonId: string;
  completedLessonIds: Set<string>;
  lesson: Curriculum[number]["lessons"][number];
  nextLessonId: string | null;
  prevLessonId: string | null;
};

export function LearnShell({
  courseTitle,
  courseSlug,
  curriculum,
  currentLessonId,
  completedLessonIds,
  lesson,
  nextLessonId,
  prevLessonId,
}: Props) {
  return (
    <div className="container learn-layout">
      <aside className="learn-sidebar" aria-label="Contenido del curso">
        <h2>{courseTitle}</h2>
        {curriculum.map((mod) => (
          <div key={mod.id} className="learn-module">
            <h3>{mod.title}</h3>
            <ul className="learn-lesson-list">
              {mod.lessons.map((item) => {
                const isActive = item.id === currentLessonId;
                const isCompleted = completedLessonIds.has(item.id);
                return (
                  <li key={item.id}>
                    <Link
                      href={`/aprender/${courseSlug}/${item.id}`}
                      className={[
                        "learn-lesson-link",
                        isActive ? "is-active" : "",
                        isCompleted ? "is-completed" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span className="learn-lesson-check" aria-hidden>
                        {isCompleted ? "✓" : ""}
                      </span>
                      <span>{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </aside>

      <div className="learn-main">
        <h1>{lesson.title}</h1>
        <LessonPlayer
          lessonId={lesson.id}
          title={lesson.title}
          contentHtml={lesson.contentHtml}
          videoUrl={lesson.videoUrl}
          courseSlug={courseSlug}
          initiallyCompleted={completedLessonIds.has(lesson.id)}
          nextLessonHref={
            nextLessonId ? `/aprender/${courseSlug}/${nextLessonId}` : null
          }
        />

        <nav className="learn-nav" aria-label="Navegación entre lecciones">
          {prevLessonId ? (
            <Link href={`/aprender/${courseSlug}/${prevLessonId}`}>
              ← Lección anterior
            </Link>
          ) : (
            <span className="is-muted">← Lección anterior</span>
          )}
          {nextLessonId ? (
            <Link href={`/aprender/${courseSlug}/${nextLessonId}`}>
              Siguiente lección →
            </Link>
          ) : (
            <Link href={`/quiz/${courseSlug}`}>Ir al quiz →</Link>
          )}
        </nav>
      </div>
    </div>
  );
}
