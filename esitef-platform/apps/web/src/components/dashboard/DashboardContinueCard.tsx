import Image from "next/image";
import Link from "next/link";
import type { DashboardCourse } from "@/lib/dashboard";

const PLACEHOLDER =
  "/img/esitef-inicio4-escuela-de-fisioterapia.webp";

type Props = {
  course: DashboardCourse;
};

export function DashboardContinueCard({ course }: Props) {
  return (
    <section className="dashboard-continue-hero" aria-label="Continuar aprendiendo">
      <div className="dashboard-continue-thumb">
        <Image
          src={course.thumbnailUrl || PLACEHOLDER}
          alt=""
          width={800}
          height={450}
          unoptimized
          priority
        />
        <div className="dashboard-continue-overlay" />
      </div>
      <div className="dashboard-continue-content">
        <span className="dashboard-continue-label">Continuar aprendiendo</span>
        <h2>{course.title}</h2>
        {course.nextLessonTitle && (
          <p className="dashboard-continue-next">
            Siguiente: <strong>{course.nextLessonTitle}</strong>
          </p>
        )}
        <div className="dashboard-continue-progress">
          <div className="dashboard-progress-meta">
            <span>
              {course.completedLessons} / {course.totalLessons} lecciones
            </span>
            <span>{course.progressPercent}%</span>
          </div>
          <div
            className="dashboard-progress-bar dashboard-progress-bar--lg"
            role="progressbar"
            aria-valuenow={course.progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="dashboard-progress-fill"
              style={{ width: `${course.progressPercent}%` }}
            />
          </div>
        </div>
        <Link href={course.continueHref} className="btn-continue btn-continue--lg">
          {course.continueLabel}
        </Link>
      </div>
    </section>
  );
}
