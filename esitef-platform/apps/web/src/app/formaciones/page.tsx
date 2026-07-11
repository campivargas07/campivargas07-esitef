export const dynamic = "force-dynamic";

import { CourseCard } from "@/components/CourseCard";
import { getPublishedCourses } from "@/lib/lms";

function gridRemainderClass(count: number) {
  const r = count % 3;
  if (r === 1) return "formaciones-grid--remainder-1";
  if (r === 2) return "formaciones-grid--remainder-2";
  return "";
}

export default async function FormacionesPage() {
  const courseList = await getPublishedCourses();
  const gridClass = `formaciones-grid ${gridRemainderClass(courseList.length)}`.trim();

  return (
    <section className="formaciones-section esitef-formaciones-page">
      <div className="formaciones-inner">
        <h1 className="formaciones-titulo">Formaciones online</h1>
        <p className="formaciones-desc">
          Cursos actualizados para elevar tu nivel profesional en fisioterapia y
          ejercicio terapéutico.
        </p>

        <div className="formaciones-container">
          <div className={gridClass}>
            {courseList.map((course, index) => (
              <CourseCard
                key={course.id}
                slug={course.slug}
                title={course.title}
                excerpt={course.excerpt}
                thumbnailUrl={course.thumbnailUrl}
                solo={courseList.length % 3 === 1 && index === courseList.length - 1}
              />
            ))}
          </div>
          {courseList.length === 0 && (
            <p className="formaciones-empty">
              No hay cursos publicados. Ejecuta el seed o la migración ETL.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
