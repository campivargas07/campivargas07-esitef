import Link from "next/link";
import "@/styles/related-courses.css";

export type RelatedCourseItem = {
  slug: string;
  title: string;
  thumbnailUrl?: string | null;
};

type Props = {
  courses: RelatedCourseItem[];
  title?: string;
  /** Fila de 4 (presenciales). Online usa lista vertical. */
  layout?: "list" | "row";
};

export function RelatedCoursesList({
  courses,
  title = "Te podría interesar",
  layout = "list",
}: Props) {
  if (courses.length === 0) return null;

  const items = layout === "row" ? courses.slice(0, 4) : courses;

  return (
    <section
      className={`pais-related${layout === "row" ? " pais-related--row" : ""}`}
      aria-labelledby="pais-related-title"
    >
      <h2 id="pais-related-title" className="pais-related-title">
        {title}
      </h2>
      <ul className="pais-related-list">
        {items.map((course) => (
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
  );
}
