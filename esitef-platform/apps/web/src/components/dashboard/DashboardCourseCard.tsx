import Image from "next/image";
import Link from "next/link";
import type { DashboardCourse } from "@/lib/dashboard";

const PLACEHOLDER =
  "https://esitef.com/online/wp-content/uploads/2022/12/esitef-inicio4-escuela-de-fisioterapia.webp";

const STATUS_LABEL = {
  not_started: "Sin empezar",
  in_progress: "En progreso",
  completed: "Completado",
} as const;

type Props = {
  course: DashboardCourse;
};

export function DashboardCourseCard({ course }: Props) {
  const badgeClass =
    course.status === "completed"
      ? "is-completed"
      : course.status === "in_progress"
        ? "is-progress"
        : "";

  return (
    <article className="dashboard-course-card">
      <div className="dashboard-course-thumb">
        <Image
          src={course.thumbnailUrl || PLACEHOLDER}
          alt=""
          width={640}
          height={360}
          unoptimized
        />
        <span className={`dashboard-course-badge ${badgeClass}`}>
          {STATUS_LABEL[course.status]}
        </span>
      </div>
      <div className="dashboard-course-body">
        <h3>{course.title}</h3>
        {course.nextLessonTitle && course.status === "in_progress" && (
          <p className="dashboard-course-next">
            Siguiente: {course.nextLessonTitle}
          </p>
        )}
        {course.totalLessons > 0 && (
          <div className="dashboard-progress">
            <div className="dashboard-progress-meta">
              <span>
                {course.completedLessons} / {course.totalLessons} lecciones
              </span>
              <span>{course.progressPercent}%</span>
            </div>
            <div
              className="dashboard-progress-bar"
              role="progressbar"
              aria-valuenow={course.progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progreso en ${course.title}`}
            >
              <div
                className="dashboard-progress-fill"
                style={{ width: `${course.progressPercent}%` }}
              />
            </div>
          </div>
        )}
        <div className="dashboard-course-actions">
          <Link href={course.continueHref} className="btn-continue">
            {course.continueLabel}
          </Link>
          <Link
            href={`/cursos/${course.slug}`}
            className="btn-outline-sm"
            aria-label={`Detalles de ${course.title}`}
          >
            Detalles
          </Link>
        </div>
      </div>
    </article>
  );
}
