import Image from "next/image";
import Link from "next/link";
import type { FormacionHub, HubItem } from "@/lib/formaciones-online";
import { HubContentGrid } from "./HubContentGrid";
import { HubAccordion, HubPlanningAccordion } from "./HubAccordion";
import { HubBodyTheme } from "./HubBodyTheme";
import { HubPricing } from "./HubPricing";

function HubBreadcrumb({ title }: { title: string }) {
  return (
    <nav className="hub-breadcrumb" aria-label="Navegación">
      <div className="hub-breadcrumb__inner">
        <Link href="/formaciones">Formaciones Online</Link>
        <span className="hub-breadcrumb__sep" aria-hidden="true">
          /
        </span>
        <span className="hub-breadcrumb__current">{title}</span>
      </div>
    </nav>
  );
}

function HubGridHeader({ hub, slug }: { hub: FormacionHub; slug: string }) {
  const title = hub.header_title || hub.title;
  const subtitle = hub.header_subtitle || hub.subtitle || "";
  const intro = hub.header_intro || hub.intro || "";

  return (
    <section
      className={`hub-grid-header hub-grid-header--${slug}`}
      aria-label={title}
    >
      <div className="hub-grid-header__inner">
        <h1 className="hub-grid-header__title">{title}</h1>
        {subtitle && <p className="hub-grid-header__subtitle">{subtitle}</p>}
        {intro && (
          <div className="hub-grid-header__intro">
            {intro.split("\n").map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function HubGridItems({ hub, slug }: { hub: FormacionHub; slug: string }) {
  const items = hub.items ?? [];
  const gridStyle = hub.grid_style ?? "showcase";
  const cols = hub.grid_cols ?? 3;
  const remainder = cols > 0 ? items.length % cols : 0;
  const isMasterclass = gridStyle === "masterclass";
  const showMeta = Boolean(hub.show_meta);
  const showExcerpt = hub.show_excerpt !== false;

  return (
    <section
      className={`hub-showcase-section hub-showcase-section--${slug}${isMasterclass ? " hub-showcase-section--masterclass" : ""}`}
      aria-label={hub.title}
    >
      <div className="hub-showcase-inner">
        <div
          className={`hub-showcase-grid hub-showcase-grid--${gridStyle} hub-showcase-grid--cols-${cols}${remainder ? ` hub-showcase-grid--remainder-${remainder}` : ""}`}
        >
          {items.map((item: HubItem, index) => {
            const isSolo = index === items.length - 1 && remainder === 1;

            if (isMasterclass) {
              return (
                <article key={item.href} className="hub-mc-card">
                  <Link href={item.href} className="hub-mc-card__link">
                    {item.img && (
                      <div className="hub-mc-card__thumb">
                        <Image
                          src={item.img}
                          alt={item.title}
                          width={80}
                          height={80}
                          unoptimized
                        />
                      </div>
                    )}
                    <h3 className="hub-mc-card__title">{item.title}</h3>
                    <div className="hub-mc-card__footer">
                      <span className="hub-mc-card__btn">Ver más</span>
                      {item.price && (
                        <span className="hub-mc-card__price">{item.price}</span>
                      )}
                    </div>
                  </Link>
                </article>
              );
            }

            return (
              <article
                key={item.href}
                className={`hub-showcase-card${isSolo ? " hub-showcase-card--solo" : ""}`}
              >
                <Link href={item.href} className="hub-showcase-card__link">
                  <div className="hub-showcase-card__media">
                    {item.badge && (
                      <span className="hub-showcase-card__badge">
                        {item.badge}
                      </span>
                    )}
                    {item.img && (
                      <Image
                        src={item.img}
                        alt={item.title}
                        width={600}
                        height={380}
                        unoptimized
                      />
                    )}
                    <div
                      className="hub-showcase-card__media-shade"
                      aria-hidden="true"
                    />
                    {showMeta && item.price && (
                      <span className="hub-showcase-card__price">
                        {item.price}
                      </span>
                    )}
                  </div>
                  <div className="hub-showcase-card__body">
                    {showMeta && item.duration && (
                      <span className="hub-showcase-card__duration">
                        {item.duration}
                      </span>
                    )}
                    <h3 className="hub-showcase-card__title">{item.title}</h3>
                    {showExcerpt && item.excerpt && (
                      <p className="hub-showcase-card__excerpt">{item.excerpt}</p>
                    )}
                    <span className="hub-showcase-card__cta">Ver más</span>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HubLandingHero({ hub }: { hub: FormacionHub }) {
  const hero = (hub.hero ?? {}) as Record<string, string | boolean | number>;
  const theme = hub.theme ?? hub.slug;
  const slug = hub.slug ?? "";
  const textOnly = Boolean(hero.text_only);
  const subtitleFirst = Boolean(hero.subtitle_first);
  const hideCta = Boolean(hero.hide_cta) || textOnly;
  const title = String(hero.title ?? hub.title);
  const subtitle = String(hero.subtitle ?? hub.subtitle ?? "");
  const rating = hero.rating ? String(hero.rating) : "";
  const reviews = hero.reviews ? Number(hero.reviews) : 0;
  const image = hero.image ? String(hero.image) : "";
  const videoEmbed = hero.video_embed ? String(hero.video_embed) : "";
  const ctaHref = hub.cta?.href;
  const ctaLabel = hub.cta?.label ?? "Comprar";
  const isCrecer = slug === "crecerenmovimiento";

  return (
    <section
      className={`hub-landing-hero hub-landing-hero--${theme}${isCrecer ? " hub-landing-hero--crecerenmovimiento" : ""}${textOnly ? " hub-landing-hero--text-only" : ""}${subtitleFirst ? " hub-landing-hero--subtitle-first" : ""}`}
    >
      <div className="hub-landing-hero__pattern" aria-hidden="true" />
      <div className="hub-landing-hero__blob" aria-hidden="true" />
      <div className="hub-landing-hero__inner">
        <div className="hub-landing-hero__content">
          {subtitleFirst && subtitle && (
            <p className="hub-landing-hero__subtitle hub-landing-hero__subtitle--lead">
              {isCrecer ? (
                <>
                  11 sesiones de 30 minutos
                  <br className="hub-landing-hero__break--mobile" />
                  {" "}
                  cada una para
                </>
              ) : (
                subtitle
              )}
            </p>
          )}
          <h1 className="hub-landing-hero__title">
            {isCrecer ? (
              <>
                CRECER en
                <br className="hub-landing-hero__break--mobile" />
                {" "}
                movimiento
              </>
            ) : (
              title
            )}
          </h1>
          {rating && (
            <div className="hub-landing-hero__rating">
              <span className="hub-landing-hero__stars" aria-hidden="true">
                ★★★★★
              </span>
              <span className="hub-landing-hero__rating-value">{rating}</span>
              {reviews > 0 && (
                <span className="hub-landing-hero__rating-count">
                  {reviews} valoraciones
                </span>
              )}
            </div>
          )}
          {!subtitleFirst && subtitle && (
            <p className="hub-landing-hero__subtitle">{subtitle}</p>
          )}
          {!hideCta && ctaHref && ctaHref !== "#" && (
            <div className="hub-landing-hero__actions">
              <Link
                href={ctaHref}
                className="hub-landing-hero__cta hub-landing-hero__cta--primary"
              >
                {ctaLabel}
              </Link>
              <a href="#precio" className="hub-landing-hero__cta hub-landing-hero__cta--ghost">
                Ver precio
              </a>
            </div>
          )}
        </div>
        {videoEmbed ? (
          <div className="hub-landing-hero__media hub-landing-hero__media--video">
            <div className="hub-landing-hero__video-frame">
              <div className="tutor-ratio tutor-ratio-1x1">
                <iframe
                  src={videoEmbed}
                  title={title}
                  allowFullScreen
                  allow="autoplay; encrypted-media; picture-in-picture"
                />
              </div>
            </div>
          </div>
        ) : (
          image && (
            <div className="hub-landing-hero__media">
              <div className="hub-landing-hero__media-frame">
                <Image
                  src={image}
                  alt={title}
                  width={900}
                  height={700}
                  unoptimized
                />
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}

function HubFaq({ hub, slug }: { hub: FormacionHub; slug: string }) {
  if (!hub.faqs?.length) return null;
  const cols = hub.faq_columns ?? 1;
  return (
    <section className={`hub-faq hub-faq--${slug}`} aria-labelledby="hub-faq-title">
      <div className="hub-faq__inner">
        <h2 id="hub-faq-title" className="hub-faq__title">
          Preguntas frecuentes
        </h2>
        <HubAccordion
          className={`hub-faq__list accordion-container${cols > 1 ? ` hub-faq__list--cols-${cols}` : ""}`}
          items={hub.faqs.map((f) => ({ title: f.q, content: f.a }))}
        />
      </div>
    </section>
  );
}

function HubCurriculum({ hub }: { hub: FormacionHub }) {
  const curriculum = hub.curriculum;
  if (!curriculum) return null;

  return (
    <section className="hub-curriculum">
      <div className="hub-curriculum__inner">
        {Object.entries(curriculum).map(([key, lessons]) => (
          <div key={key} className="hub-curriculum__block">
            <h2 className="hub-curriculum__heading">
              {key === "main" ? "Contenido del curso" : "Resúmenes"}
            </h2>
            <ul className="hub-curriculum__list">
              {lessons.map((lesson) => (
                <li key={lesson.title}>
                  <span>{lesson.title}</span>
                  <span>{lesson.duration}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FormacionHubContent({
  hub,
  slug,
}: {
  hub: FormacionHub;
  slug: string;
}) {
  const theme = hub.theme ?? slug;
  const layout = hub.layout ?? "grid";

  return (
    <div
      className={`formacion-hub-page formacion-hub-page--${theme} formacion-hub-page--${slug}${hub.grid_style === "masterclass" ? " formacion-hub-page--masterclass" : ""}`}
    >
      <HubBodyTheme theme={theme} />
      <HubBreadcrumb title={hub.title} />
      {layout === "grid" ? (
        <>
          <HubGridHeader hub={hub} slug={slug} />
          <HubGridItems hub={hub} slug={slug} />
          <HubFaq hub={hub} slug={slug} />
        </>
      ) : (
        <>
          <HubLandingHero hub={hub} />
          {(hub.landing_order ?? ["content_grid", "pricing"]).map((block) => {
            switch (block) {
              case "content_grid":
                return <HubContentGrid key={block} hub={hub} />;
              case "planning":
                return hub.planning ? (
                  <HubPlanningAccordion
                    key={block}
                    title={hub.planning_title ?? "Planning de contenidos"}
                    description={hub.planning_description}
                    planning={hub.planning}
                  />
                ) : null;
              case "pricing":
                return <HubPricing key={block} hub={hub} />;
              case "curriculum":
                return <HubCurriculum key={block} hub={hub} />;
              case "faqs":
                return <HubFaq key={block} hub={hub} slug={slug} />;
              default:
                return null;
            }
          })}
          {hub.sticky_cta && hub.cta?.href && hub.cta.href !== "#" && (
            <div className="hub-sticky-cta">
              <Link href={hub.cta.href} className="hub-sticky-cta__btn">
                {hub.cta.label ?? "Comprar"}
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
