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

export function DashboardContinueRow({ course }: Props) {
  return (
    <Link
      href={course.continueHref}
      className="dashboard-continue-row"
      aria-label={`Continuar ${course.title}`}
    >
      <div className="dashboard-continue-row-thumb">
        <Image
          src={course.thumbnailUrl || PLACEHOLDER}
          alt=""
          width={320}
          height={180}
          unoptimized
        />
      </div>
      <div className="dashboard-continue-row-body">
        <span className="dashboard-continue-row-meta">
          {STATUS_LABEL[course.status]}
        </span>
        <h3>{course.title}</h3>
        {course.totalLessons > 0 && (
          <>
            <p className="dashboard-continue-row-lessons">
              {course.completedLessons} de {course.totalLessons} lecciones ·{" "}
              {course.progressPercent}% completado
            </p>
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
          </>
        )}
      </div>
    </Link>
  );
}
