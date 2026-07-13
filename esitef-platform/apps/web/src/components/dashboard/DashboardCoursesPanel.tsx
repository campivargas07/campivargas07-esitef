"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardCourseCard } from "@/components/dashboard/DashboardCourseCard";
import { DashboardEmptyIllustration } from "@/components/dashboard/DashboardEmptyIllustration";
import type { CourseFilter, DashboardCourse } from "@/lib/dashboard";

const FILTERS: { key: CourseFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "in_progress", label: "En progreso" },
  { key: "completed", label: "Completados" },
  { key: "not_started", label: "Sin empezar" },
];

type Props = {
  courses: DashboardCourse[];
  notStartedCount: number;
};

export function DashboardCoursesPanel({ courses, notStartedCount }: Props) {
  const [filter, setFilter] = useState<CourseFilter>("all");

  const filtered =
    filter === "all"
      ? courses
      : courses.filter((c) => c.status === filter);

  return (
    <>
      {notStartedCount > 0 && (
        <div className="dashboard-banner" role="status">
          Tienes {notStartedCount} curso{notStartedCount > 1 ? "s" : ""} sin
          empezar — ¡elige uno y comienza hoy!
        </div>
      )}

      <div className="dashboard-filters" role="tablist" aria-label="Filtrar cursos">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={filter === f.key}
            className={filter === f.key ? "is-active" : undefined}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            <span className="dashboard-filter-count">
              {f.key === "all"
                ? courses.length
                : courses.filter((c) => c.status === f.key).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="dashboard-empty">
          <DashboardEmptyIllustration type="courses" />
          <h3>No hay cursos en esta categoría</h3>
          <p>Prueba otro filtro o explora el catálogo de formaciones.</p>
          <Link href="/formaciones" className="btn btn-primary">
            Explorar formaciones
          </Link>
        </div>
      ) : (
        <div className="dashboard-course-grid">
          {filtered.map((course) => (
            <DashboardCourseCard key={course.courseId} course={course} />
          ))}
        </div>
      )}
    </>
  );
}
