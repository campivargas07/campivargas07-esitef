import type { CSSProperties } from "react";
import Link from "next/link";
import {
  PresencialAccordion,
  TeacherAccordion,
} from "@/components/presencial/PresencialAccordion";
import { PresencialRichSyllabus } from "@/components/presencial/PresencialRichSyllabus";
import { PresencialCheckoutPlans } from "@/components/presencial/PresencialCheckoutPlans";
import { PresencialInscribeModal } from "@/components/presencial/PresencialInscribeModal";
import {
  MissionText,
  PresencialHeroIcon,
  PresencialStatIcon,
  StatValue,
  splitPresencialHeroMeta,
} from "@/components/presencial/PresencialIcons";
import type { PresencialFormacion } from "@/lib/presenciales";
import { isPresencialHybrid, isPresencialPreview } from "@/lib/presenciales";
import {
  getPresencialCheckoutConfig,
  isPresencialCheckoutEnabled,
} from "@/lib/presencial-checkout";
import { TrackingEcommerceEvent } from "@/components/tracking/TrackingEvents";
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
    program_extended = [],
    professors_resolved = [],
    inscription,
  } = formacion;

  const courseLabel = [title, title_bold].filter(Boolean).join(" ");
  const pageSlug = formacion.page_slug;
  const isPreview = isPresencialPreview(formacion);
  const previewTarget = formacion.preview_of;
  // Preview V2 reuses live checkout so the top matches the public page
  const checkoutSlug =
    isPreview && previewTarget ? previewTarget : pageSlug;
  const checkoutConfig = checkoutSlug
    ? getPresencialCheckoutConfig(checkoutSlug)
    : null;
  const checkoutOn = checkoutSlug
    ? isPresencialCheckoutEnabled(checkoutSlug)
    : false;
  const syllabusTitle = syllabus?.title ?? "Programa";
  const syllabusDesc = syllabus?.description ?? "";
  const syllabusPdf = syllabus?.pdf_url ?? "";
  const richLayout = formacion.content_layout === "rich";
  const firstPlan = checkoutConfig
    ? Object.values(checkoutConfig.plans)[0]
    : null;

  return (
    <div className={`presencial-page${pageSlug ? ` presencial-page--${pageSlug}` : ""}`}>
      {pageSlug && !isPreview ? (
        <TrackingEcommerceEvent
          event="view_item"
          currency={(checkoutConfig?.currency ?? "EUR").toUpperCase()}
          value={firstPlan?.price ?? 0}
          items={[
            {
              item_id: pageSlug,
              item_name: courseLabel,
              price: firstPlan?.price ?? 0,
              quantity: 1,
            },
          ]}
        />
      ) : null}
      <section className="course-hero">
        <div className="hero-content">
          {subtitle && <span className="subtitle">{subtitle}</span>}
          <h1 className="hero-title">
            <span className="hero-title-main">{title}</span>
            {title_bold ? (
              <span className="hero-title-sub">{title_bold}</span>
            ) : null}
          </h1>

          {hero_meta.length > 0 && (
            <div className="hero-meta">
              {hero_meta.map((meta, index) => {
                const { label, value, inline } = splitPresencialHeroMeta(meta);
                return (
                  <span key={`${meta.icon}-${inline}`}>
                    {index > 0 && <span className="hero-meta-sep" aria-hidden />}
                    <article className="hero-meta-item">
                      <div className="hero-meta-icon">
                        <PresencialHeroIcon icon={meta.icon} />
                      </div>
                      <div className="hero-meta-body">
                        {label ? (
                          <>
                            <span className="hero-meta-label">{label}</span>
                            <span className="hero-meta-value hero-meta-value--split">
                              {value}
                            </span>
                            <span className="hero-meta-value hero-meta-value--inline">
                              {inline}
                            </span>
                          </>
                        ) : (
                          <span className="hero-meta-value">{value}</span>
                        )}
                      </div>
                    </article>
                  </span>
                );
              })}
            </div>
          )}

          {checkoutOn ? (
            <a href="#inscribirme" className="hero-btn">
              Inscribirme ahora
            </a>
          ) : isPreview && previewTarget ? (
            <a href={`/${previewTarget}#inscribirme`} className="hero-btn">
              Inscribirme ahora
            </a>
          ) : inscription ? (
            <PresencialInscribeModal
              inscription={inscription}
              courseLabel={courseLabel}
              instanceSlug={pageSlug}
            />
          ) : (
            <Link href="/contacto" className="hero-btn">
              Consultar inscripción
            </Link>
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
          <div
            className={`mission-card${pageSlug === "evaluacion-dinamica-funcional-gdl" ? " mission-card--eval-dinamica" : ""}`}
            style={
              stats_media?.url
                ? ({
                    "--mission-bg": `url("${stats_media.url}")`,
                  } as CSSProperties)
                : undefined
            }
          >
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
                  <StatValue value={stat.value} statKey={stat.key} />
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

      {checkoutOn && checkoutConfig && checkoutSlug && (
        <PresencialCheckoutPlans
          instanceSlug={checkoutSlug}
          config={checkoutConfig}
          pais={formacion.pais}
          allowGuestCheckout={!isPresencialHybrid(formacion)}
          courseLabel={courseLabel}
          inscription={inscription}
        />
      )}

      {program.length > 0 && (
        <section className="course-syllabus">
          <div className="syllabus-card">
            <div className="syllabus-bg" aria-hidden />
            <div className="syllabus-inner">
              <div className="syllabus-left">
                <h2>{syllabusTitle}</h2>
                {syllabusDesc && <p>{syllabusDesc}</p>}
                {!richLayout && syllabusPdf ? (
                  <a
                    href={syllabusPdf}
                    className="syllabus-btn desktop-only-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Descargar PDF
                  </a>
                ) : null}
              </div>
              <PresencialAccordion items={program} />
              {!richLayout && syllabusPdf ? (
                <a
                  href={syllabusPdf}
                  className="syllabus-btn mobile-only-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Descargar PDF
                </a>
              ) : null}
            </div>
          </div>
        </section>
      )}

      {professors_resolved.length > 0 && (
        <section className="teachers-section">
          <h2>
            {professors_resolved.length === 1
              ? "Docente de la formación"
              : "Docentes de la Formación"}
          </h2>
          <TeacherAccordion professors={professors_resolved} />
        </section>
      )}

      {richLayout && program_extended.length > 0 ? (
        <PresencialRichSyllabus
          pdfUrl={syllabusPdf || undefined}
          program={program_extended}
          mediaUrl={stats_media?.url || hero_image?.url}
          mediaAlt={stats_media?.alt || hero_image?.alt}
        />
      ) : null}

      {formacion.pais && (
        <p style={{ textAlign: "center", padding: "2rem 1rem" }}>
          <Link href={`/${formacion.pais}`}>← Ver más formaciones presenciales</Link>
        </p>
      )}
    </div>
  );
}
