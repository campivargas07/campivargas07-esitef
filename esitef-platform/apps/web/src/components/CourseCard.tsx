import Image from "next/image";
import Link from "next/link";

const PLACEHOLDER =
  "/img/esitef-inicio4-escuela-de-fisioterapia.webp";

type Props = {
  slug: string;
  title: string;
  excerpt?: string | null;
  thumbnailUrl?: string | null;
  solo?: boolean;
};

export function CourseCard({ slug, title, excerpt, thumbnailUrl, solo }: Props) {
  return (
    <Link
      href={`/cursos/${slug}`}
      className={`curso-card${solo ? " curso-card--solo" : ""}`}
    >
      <div className="curso-image">
        <Image
          src={thumbnailUrl || PLACEHOLDER}
          alt={title}
          width={640}
          height={400}
          unoptimized
        />
      </div>
      <div className="curso-content">
        <div className="curso-header">
          <h3>{title}</h3>
          <span className="curso-ver-mas">Ver más</span>
        </div>
        {excerpt && <p className="curso-excerpt">{excerpt}</p>}
      </div>
    </Link>
  );
}
