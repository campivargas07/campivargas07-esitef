"use client";

import Link from "next/link";
import { useState } from "react";
import type { getCourseCurriculum } from "@/lib/lms";

type Curriculum = Awaited<ReturnType<typeof getCourseCurriculum>>;

function formatDuration(seconds: number | null) {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  return `${m} min`;
}

type Props = {
  courseTitle: string;
  courseSlug: string;
  curriculum: Curriculum;
  currentLessonId: string;
  completedLessonIds: Set<string>;
  open: boolean;
  onClose: () => void;
};

export function LearnSidebar({
  courseTitle,
  courseSlug,
  curriculum,
  currentLessonId,
  completedLessonIds,
  open,
  onClose,
}: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleModule = (id: string) => {
    setCollapsed((c) => ({ ...c, [id]: !c[id] }));
  };

  return (
    <>
      <div
        className={`learn-sidebar-backdrop${open ? " is-open" : ""}`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`learn-sidebar${open ? " is-open" : ""}`}
        aria-label="Contenido del curso"
      >
        <div className="learn-sidebar-header">
          <h2>{courseTitle}</h2>
          <button
            type="button"
            className="learn-sidebar-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {curriculum.map((mod) => {
          const isCollapsed = collapsed[mod.id];
          return (
            <div key={mod.id} className="learn-module">
              <button
                type="button"
                className="learn-module-toggle"
                onClick={() => toggleModule(mod.id)}
                aria-expanded={!isCollapsed}
              >
                <span>{mod.title}</span>
                <span aria-hidden>{isCollapsed ? "▸" : "▾"}</span>
              </button>
              {!isCollapsed && (
                <ul className="learn-lesson-list">
                  {mod.lessons.map((item) => {
                    const isActive = item.id === currentLessonId;
                    const isCompleted = completedLessonIds.has(item.id);
                    const hasVideo = Boolean(item.videoUrl);
                    const duration = formatDuration(item.durationSeconds);
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
                          onClick={onClose}
                        >
                          <span className="learn-lesson-icon" aria-hidden>
                            {isCompleted ? "✓" : isActive ? "▶" : hasVideo ? "▶" : "○"}
                          </span>
                          <span className="learn-lesson-text">{item.title}</span>
                          {duration && (
                            <span className="learn-lesson-duration">{duration}</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </aside>
    </>
  );
}
