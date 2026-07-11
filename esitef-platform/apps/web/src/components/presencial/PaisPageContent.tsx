"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  courseCardLayout,
  getPaisCourseUrl,
  isExternalCourseUrl,
  type Pais,
  type PaisCourse,
} from "@/lib/presenciales";

type Props = {
  pais: Pais;
  relatedCourses: { slug: string; title: string; thumbnailUrl: string | null }[];
};

function CourseCard({ course }: { course: PaisCourse }) {
  const href = getPaisCourseUrl(course);
  const external = isExternalCourseUrl(course);
  const hybrid =
    course.type.toLowerCase().includes("híbrida") ||
    course.type.toLowerCase().includes("hibrida");
  const desc = [course.dates, course.professor].filter(Boolean).join(" · ");

  const body = (
    <>
      {course.image && (
        <span className="pais-course-thumb">
          <img src={course.image} alt={course.title} loading="lazy" />
        </span>
      )}
      <span className="pais-course-body">
        <span className="pais-course-type">{course.type}</span>
        <span className="pais-course-title">{course.title}</span>
        {desc && <span className="pais-course-desc">{desc}</span>}
        {course.dates && (
          <span className="pais-course-row pais-course-row--date">
            <svg
              className="pais-course-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <path d="M3 10h18" />
            </svg>
            {course.dates}
          </span>
        )}
        {course.professor && (
          <span className="pais-course-row pais-course-row--prof">
            <svg
              className="pais-course-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <circle cx="12" cy="8" r="5" />
              <path d="M20 21a8 8 0 0 0-16 0" />
            </svg>
            {course.professor}
          </span>
        )}
      </span>
    </>
  );

  const className = `pais-course-card${hybrid ? " pais-course-card--hybrid" : ""}`;

  if (external) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {body}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {body}
    </Link>
  );
}

export function PaisPageContent({ pais, relatedCourses }: Props) {
  const sedes = pais.sedes.filter((s) => s.name);
  const [activeSede, setActiveSede] = useState(sedes[0]?.slug ?? "");

  const activeSedeData = sedes.find((s) => s.slug === activeSede) ?? sedes[0];
  const layout = courseCardLayout(activeSedeData?.courses.length ?? 0);

  useEffect(() => {
    const grid = document.querySelector(".pais-grid");
    if (!grid) return;
    grid.classList.toggle("pais-grid--courses-multi", layout === "multi");
    grid.classList.toggle("pais-grid--courses-quad", layout === "quad");
  }, [layout, activeSede]);

  if (!sedes.length) return null;

  return (
    <section className="pais-stage" aria-label={pais.title}>
      <div className="pais-module">
        <div className="pais-grid">
          <aside className="pais-nav">
            <div className="pais-nav-head">
              <span className="pais-eyebrow">Presencial</span>
              <h1 className="pais-title">{pais.title}</h1>
            </div>
          </aside>

          <div className="pais-sedes-module">
            <div className="pais-sedes-glow" aria-hidden="true" />

            <div
              className="pais-tabs"
              role="tablist"
              aria-label="Sedes formativas"
            >
              {sedes.map((sede) => {
                const isActive = sede.slug === activeSede;
                return (
                  <button
                    key={sede.slug}
                    type="button"
                    className={`pais-tab${isActive ? " is-active" : ""}`}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`pais-panel-${sede.slug}`}
                    onClick={() => setActiveSede(sede.slug)}
                  >
                    <span className="pais-tab-text">
                      <span className="pais-tab-name">{sede.name}</span>
                    </span>
                    <span className="pais-tab-arrow" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pais-detail" role="region" aria-live="polite">
              <div className="pais-detail-card">
                <div className="pais-detail-glow" aria-hidden="true" />
                {sedes.map((sede) => {
                  const courses = sede.courses ?? [];
                  const sedeLayout = courseCardLayout(courses.length);
                  const isActive = sede.slug === activeSede;
                  let panelMod = "";
                  if (courses.length === 4) panelMod = " pais-sede-panel--quad";
                  else if (courses.length >= 3)
                    panelMod = " pais-sede-panel--multi";

                  return (
                    <div
                      key={sede.slug}
                      className={`pais-sede-panel${isActive ? " is-active" : ""}${panelMod}`}
                      id={`pais-panel-${sede.slug}`}
                      role="tabpanel"
                      hidden={!isActive}
                    >
                      {courses.length > 0 ? (
                        <div className={`pais-courses pais-courses--${sedeLayout}`}>
                          {courses.map((course) => (
                            <CourseCard
                              key={`${sede.slug}-${course.title}`}
                              course={course}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="pais-empty">
                          Próximamente nuevas formaciones en esta sede.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {relatedCourses.length > 0 && (
        <section className="pais-related" aria-labelledby="pais-related-title">
          <h2 id="pais-related-title" className="pais-related-title">
            Te podría interesar
          </h2>
          <ul className="pais-related-list">
            {relatedCourses.map((course) => (
              <li key={course.slug}>
                <Link href={`/cursos/${course.slug}`} className="pais-related-item">
                  <span className="pais-related-thumb">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} />
                    ) : (
                      <span className="pais-related-fallback" aria-hidden />
                    )}
                  </span>
                  <span className="pais-related-name">{course.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}