"use client";

import Link from "next/link";
import { useState } from "react";
import { DiscussionsPanel } from "@/components/learn/DiscussionsPanel";
import { LearnProgressBar } from "@/components/learn/LearnProgressBar";
import { LearnSidebar } from "@/components/learn/LearnSidebar";
import { LearnTopbar } from "@/components/learn/LearnTopbar";
import { LessonToolbar } from "@/components/learn/LessonToolbar";
import { NotesPanel } from "@/components/learn/NotesPanel";
import { LessonPlayer } from "@/components/LessonPlayer";
import type { getCourseCurriculum } from "@/lib/lms";
import "@/styles/learn.css";

type Curriculum = Awaited<ReturnType<typeof getCourseCurriculum>>;

type Props = {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  curriculum: Curriculum;
  currentLessonId: string;
  completedLessonIds: Set<string>;
  lesson: Curriculum[number]["lessons"][number];
  nextLessonId: string | null;
  prevLessonId: string | null;
};

export function LearnShellClient({
  courseId,
  courseTitle,
  courseSlug,
  curriculum,
  currentLessonId,
  completedLessonIds,
  lesson,
  nextLessonId,
  prevLessonId,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [panel, setPanel] = useState<"notes" | "discussions" | null>(null);

  const allLessons = curriculum.flatMap((m) => m.lessons);
  const total = allLessons.length;
  const completed = allLessons.filter((l) => completedLessonIds.has(l.id)).length;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const nextLesson = nextLessonId
    ? allLessons.find((l) => l.id === nextLessonId)
    : null;

  return (
    <div className={`learn-shell${focusMode ? " learn-shell--focus" : ""}`}>
      <LearnTopbar
        courseTitle={courseTitle}
        courseSlug={courseSlug}
        progressPercent={progressPercent}
        focusMode={focusMode}
        onToggleFocus={() => setFocusMode((f) => !f)}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
      />

      <LearnProgressBar percent={progressPercent} />

      <div className={`learn-body${panel ? " learn-body--with-panel" : ""}`}>
        {!focusMode && (
          <LearnSidebar
            courseTitle={courseTitle}
            courseSlug={courseSlug}
            curriculum={curriculum}
            currentLessonId={currentLessonId}
            completedLessonIds={completedLessonIds}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        <div className="learn-main">
          <LessonToolbar
            activePanel={panel}
            onPanelChange={setPanel}
          />

          <h1 className="learn-lesson-title">{lesson.title}</h1>

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

          {nextLesson && (
            <Link
              href={`/aprender/${courseSlug}/${nextLesson.id}`}
              className="learn-next-preview"
            >
              <span className="learn-next-label">Siguiente lección</span>
              <strong>{nextLesson.title}</strong>
            </Link>
          )}

          <nav className="learn-nav" aria-label="Navegación entre lecciones">
            {prevLessonId ? (
              <Link href={`/aprender/${courseSlug}/${prevLessonId}`}>
                ← Anterior
              </Link>
            ) : (
              <span className="is-muted">← Anterior</span>
            )}
            {nextLessonId ? (
              <Link href={`/aprender/${courseSlug}/${nextLessonId}`}>
                Siguiente →
              </Link>
            ) : (
              <Link href={`/quiz/${courseSlug}`}>Ir al quiz →</Link>
            )}
          </nav>
        </div>

        {panel === "notes" && (
          <NotesPanel
            lessonId={lesson.id}
            courseId={courseId}
            onClose={() => setPanel(null)}
          />
        )}
        {panel === "discussions" && (
          <DiscussionsPanel
            lessonId={lesson.id}
            courseId={courseId}
            onClose={() => setPanel(null)}
          />
        )}
      </div>

      <button
        type="button"
        className="learn-mobile-drawer-btn"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir contenido del curso"
      >
        Contenido
      </button>
    </div>
  );
}
