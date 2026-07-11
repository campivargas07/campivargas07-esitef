import Link from "next/link";
import {
  PresencialAccordion,
  TeacherAccordion,
} from "@/components/presencial/PresencialAccordion";
import { PresencialCheckoutPlans } from "@/components/presencial/PresencialCheckoutPlans";
import { PresencialInscribeModal } from "@/components/presencial/PresencialInscribeModal";
import {
  MissionText,
  PresencialHeroIcon,
  PresencialStatIcon,
  StatValue,
} from "@/components/presencial/PresencialIcons";
import type { PresencialFormacion } from "@/lib/presenciales";
import {
  getPresencialCheckoutConfig,
  isPresencialCheckoutEnabled,
} from "@/lib/presencial-checkout";
import "@/styles/presencial.css";

type Props = {
  formacion: PresencialFormacion;
};

export function PresencialPageContent({ formacion }: Props) {
  const {
    subtitle,
    title,
    title_bold,
    hero_meta = [],
    hero_image,
    mission,
    stats = [],
    stats_media,
    syllabus,
    program = [],
    professors_resolved = [],
    inscription,
  } = formacion;

  const courseLabel = [title, title_bold].filter(Boolean).join(" ");
  const pageSlug = formacion.page_slug;
  const checkoutConfig = pageSlug
    ? getPresencialCheckoutConfig(pageSlug)
    : null;
  const checkoutOn = pageSlug ? isPresencialCheckoutEnabled(pageSlug) : false;
  const syllabusTitle = syllabus?.title ?? "Programa";
  const syllabusDesc = syllabus?.description ?? "";
  const syllabusPdf = syllabus?.pdf_url ?? "";

  return (
    <div className="presencial-page">
      <section className="course-hero">
        <div className="hero-content">
          {subtitle && <span className="subtitle">{subtitle}</span>}
          <h1>
            {title_bold ? (
              <>
                <b>{title}</b> {title_bold}
              </>
            ) : (
              title
            )}
          </h1>

          {hero_meta.length > 0 && (
            <div className="hero-meta">
              {hero_meta.map((meta, index) => (
                <span key={`${meta.icon}-${meta.value}`}>
                  {index > 0 && <span className="hero-meta-sep" aria-hidden />}
                  <article className="hero-meta-item">
                    <div className="hero-meta-icon">
                      <PresencialHeroIcon icon={meta.icon} />
                    </div>
                    <div className="hero-meta-body">
                      <span className="hero-meta-value">{meta.value}</span>
                    </div>
                  </article>
                </span>
              ))}
            </div>
          )}

          {checkoutOn ? (
            <a href="#inscribirme" className="hero-btn">
              Inscribirme ahora
            </a>
          ) : inscription ? (
            <PresencialInscribeModal
              inscription={inscription}
              courseLabel={courseLabel}
            />
          ) : (
            <a href="#inscribirme" className="hero-btn">
              Inscribirme ahora
            </a>
          )}
        </div>

        {hero_image?.url && (
          <div className="hero-image">
            <img src={hero_image.url} alt={hero_image.alt || title} />
          </div>
        )}
      </section>

      <section className="course-details">
        {mission && (
          <div className="mission-card">
            <MissionText html={mission} />
          </div>
        )}

        {(stats.length > 0 || stats_media?.url) && (
          <div className="stats-grid">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card">
                <div className="stat-top">
                  <div className="stat-icon">
                    <PresencialStatIcon statKey={stat.key} />
                  </div>
                  <h4>{stat.label}</h4>
                </div>
                <p>
                  <StatValue value={stat.value} />
                </p>
              </div>
            ))}
            {stats_media?.url && (
              <div className="stat-card stat-card--media">
                <img
                  src={stats_media.url}
                  alt={stats_media.alt || ""}
                  className="stat-card__img"
                />
              </div>
            )}
          </div>
        )}
      </section>

      {program.length > 0 && (
        <section className="course-syllabus">
          <div className="syllabus-card">
            <div className="syllabus-bg" aria-hidden />
            <div className="syllabus-inner">
              <div className="syllabus-left">
                <h2>{syllabusTitle}</h2>
                {syllabusDesc && <p>{syllabusDesc}</p>}
                {syllabusPdf && (
                  <a
                    href={syllabusPdf}
                    className="syllabus-btn desktop-only-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Descargar PDF
                  </a>
                )}
              </div>
              <PresencialAccordion items={program} />
              {syllabusPdf && (
                <a
                  href={syllabusPdf}
                  className="syllabus-btn mobile-only-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Descargar PDF
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {professors_resolved.length > 0 && (
        <section className="teachers-section">
          <h2>Docentes de la Formación</h2>
          <TeacherAccordion professors={professors_resolved} />
        </section>
      )}

      {checkoutOn && checkoutConfig && pageSlug && (
        <PresencialCheckoutPlans
          instanceSlug={pageSlug}
          courseTitle={courseLabel}
          config={checkoutConfig}
        />
      )}

      {formacion.pais && (
        <p style={{ textAlign: "center", padding: "2rem 1rem" }}>
          <Link href={`/${formacion.pais}`}>← Ver más formaciones presenciales</Link>
        </p>
      )}
    </div>
  );
}
