"use client";

import { useEffect, useRef } from "react";

type Lesson = { id: string; title: string; durationSeconds?: number | null };
type Module = { id: string; title: string; lessons: Lesson[] };

export function LandingCurriculum({ curriculum }: { curriculum: Module[] }) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const first = listRef.current?.querySelector(
      ".landing-curriculum__topic.active .landing-curriculum__topic-body"
    ) as HTMLElement | null;
    if (first) first.style.maxHeight = `${first.scrollHeight}px`;
  }, [curriculum]);

  if (curriculum.length === 0) return null;

  function toggleTopic(btn: HTMLButtonElement) {
    const topic = btn.closest(".landing-curriculum__topic");
    const body = topic?.querySelector(
      ".landing-curriculum__topic-body"
    ) as HTMLElement | null;
    const isActive = topic?.classList.contains("active");

    listRef.current
      ?.querySelectorAll(".landing-curriculum__topic")
      .forEach((t) => {
        t.classList.remove("active");
        const b = t.querySelector(".landing-curriculum__topic-body") as HTMLElement;
        if (b) b.style.maxHeight = "";
        const h = t.querySelector(".landing-curriculum__topic-header");
        h?.setAttribute("aria-expanded", "false");
      });

    if (!isActive && topic && body) {
      topic.classList.add("active");
      body.style.maxHeight = `${body.scrollHeight}px`;
      btn.setAttribute("aria-expanded", "true");
    }
  }

  function formatDuration(seconds?: number | null) {
    if (!seconds) return "";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`;
  }

  return (
    <section
      className="landing-section landing-curriculum"
      aria-labelledby="landing-curriculum-title"
    >
      <h2 id="landing-curriculum-title" className="landing-section__title">
        Contenido
      </h2>
      <div className="landing-curriculum__list" ref={listRef}>
        {curriculum.map((mod, index) => (
          <div
            key={mod.id}
            className={`landing-curriculum__topic${index === 0 ? " active" : ""}`}
          >
            <button
              className="landing-curriculum__topic-header"
              type="button"
              aria-expanded={index === 0 ? "true" : "false"}
              onClick={(e) => toggleTopic(e.currentTarget)}
            >
              {mod.title}
              <span className="landing-curriculum__topic-icon" aria-hidden="true">
                +
              </span>
            </button>
            <div className="landing-curriculum__topic-body">
              <div className="landing-curriculum__lessons">
                {mod.lessons.map((lesson) => (
                  <div key={lesson.id} className="landing-curriculum__lesson">
                    <span className="landing-curriculum__lesson-title">
                      <span
                        className="landing-curriculum__lesson-icon"
                        aria-hidden="true"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </span>
                      {lesson.title}
                    </span>
                    {lesson.durationSeconds ? (
                      <span className="landing-curriculum__lesson-duration">
                        {formatDuration(lesson.durationSeconds)}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
