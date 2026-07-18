import Image from "next/image";
import Link from "next/link";
import type { DashboardCourse } from "@/lib/dashboard";

const PLACEHOLDER =
  "/img/esitef-inicio4-escuela-de-fisioterapia.webp";

const STATUS_LABEL = {
  not_started: "Sin empezar",
  in_progress: "En progreso",
  completed: "Completado",
} as const;

type Props = {
  course: DashboardCourse;
};

export function DashboardContinueRow({ course }: Props) {
  const resumeLabel =
    course.status === "not_started" ? "▶ Empezar" : "▶ Continuar";

  return (
    <article className="dashboard-continue-card">
      <div className="dashboard-continue-card-thumb">
        <Image
          src={course.thumbnailUrl || PLACEHOLDER}
          alt=""
          width={640}
          height={360}
          unoptimized
        />
      </div>
      <div className="dashboard-continue-card-body">
        <span className="dashboard-continue-card-meta">
          {STATUS_LABEL[course.status]}
        </span>
        <h3>{course.title}</h3>
        {course.totalLessons > 0 && (
          <>
            <p className="dashboard-continue-card-lessons">
              {course.completedLessons} de {course.totalLessons} lecciones ·{" "}
              {course.progressPercent}% completado
            </p>
            <div
              className="dashboard-progress-bar dashboard-progress-bar--success"
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
        <Link href={course.continueHref} className="dashboard-resume-btn">
          {resumeLabel}
        </Link>
      </div>
    </article>
  );
}
