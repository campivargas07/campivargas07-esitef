import type { PresencialProgramModule } from "@/lib/presenciales";
import { AxesEditorial } from "@/components/presencial/AxesEditorial";
import { LongevidadMindMap } from "@/components/presencial/LongevidadMindMap";
import "@/styles/presencial-rich.css";

/** ponytail: pausa temporal — poner en true para reactivar */
const SHOW_PANORAMA = false;
const SHOW_MANIFESTO = false;
const SHOW_AXES = false;

type Props = {
  program: PresencialProgramModule[];
  mediaUrl?: string;
  mediaAlt?: string;
  /** Segunda imagen (p.ej. hero) para bloques 60/40 */
  mediaUrlB?: string;
  mediaAltB?: string;
  /** Misma acción que el CTA del hero */
  ctaHref?: string;
  ctaLabel?: string;
};

function StorySplit({
  title,
  items,
  mark,
  mediaUrl,
  mediaAlt,
  flip,
  plain,
}: {
  title: string;
  items: string[];
  mark?: string;
  mediaUrl?: string;
  mediaAlt?: string;
  flip?: boolean;
  /** Sin fondo shell / textura */
  plain?: boolean;
}) {
  return (
    <div
      className={
        plain
          ? "presencial-rich__panel presencial-rich__panel--panorama presencial-rich__panel--panorama-plain"
          : "presencial-rich__panel presencial-rich__panel--panorama"
      }
    >
      <div
        className={
          flip
            ? "presencial-rich__panorama presencial-rich__panorama--flip"
            : "presencial-rich__panorama"
        }
      >
        {mark ? (
          <span className="presencial-rich__panorama-mark" aria-hidden>
            {mark}
          </span>
        ) : null}
        <div className="presencial-rich__panorama-copy">
          <h3>{title}</h3>
          {items.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        {mediaUrl ? (
          <div className="presencial-rich__panorama-media">
            <span className="presencial-rich__panorama-line" aria-hidden />
            <div
              className="presencial-rich__visual"
              style={{ backgroundImage: `url("${mediaUrl}")` }}
              role="img"
              aria-label={mediaAlt || ""}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function findByTitle(
  program: PresencialProgramModule[],
  match: (title: string) => boolean
) {
  return program.find((m) => match(m.title));
}

function findAll(
  program: PresencialProgramModule[],
  match: (title: string) => boolean
) {
  return program.filter((m) => match(m.title));
}

function dayMeta(title: string): {
  kind: string;
  label: string;
  hours: string;
  professors: string;
} {
  const kind = title.startsWith("Online")
    ? "Online"
    : title.startsWith("Presencial")
      ? "Presencial"
      : "";
  const rest = title
    .replace(/^Online\s*[—-]\s*/i, "")
    .replace(/^Presencial\s*[—-]\s*/i, "")
    .trim();

  // "Sesión 1 - … — Prof. Name" (when completo en el label; split en el último — Prof.)
  const profSplit = rest.match(/^(.+)\s*[—-]\s*(Prof\..+)$/i);
  if (profSplit) {
    return {
      kind,
      label: profSplit[1].trim(),
      hours: "",
      professors: profSplit[2].trim(),
    };
  }

  return { kind, label: rest, hours: "", professors: "" };
}

/** "2 hs" → "2hrs", "9 a 18 hs" → "9–18hrs" */
function formatHours(hours: string): string {
  return hours
    .replace(/\s*a\s*/gi, "–")
    .replace(/\s*hs?\.?\s*$/i, "hrs")
    .replace(/\s+/g, "")
    .trim();
}

function dayWhen(label: string, hours: string): string {
  const h = hours ? formatHours(hours) : "";
  if (label && h) return `${label} - ${h}`;
  return label || h;
}

const LEARN_ICONS = [
  // Basal — strength / activity
  <svg key="basal" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M6.5 6.5 4 9l2.5 2.5" />
    <path d="M17.5 6.5 20 9l-2.5 2.5" />
    <path d="M4 9h16" />
    <path d="M9 9v10a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V9" />
    <path d="M9 4h6" />
  </svg>,
  // Objetos — hand / grip
  <svg key="obj" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="3.5" />
    <path d="M12 2v3" />
    <path d="M12 19v3" />
    <path d="m4.9 4.9 2.1 2.1" />
    <path d="m17 17 2.1 2.1" />
    <path d="M2 12h3" />
    <path d="M19 12h3" />
    <path d="m4.9 19.1 2.1-2.1" />
    <path d="m17 7 2.1-2.1" />
  </svg>,
  // Expresivo — music / rhythm
  <svg key="expr" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>,
  // Somática — body awareness
  <svg key="soma" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="5" r="2.5" />
    <path d="M12 7.5v5" />
    <path d="m8 10 4 2.5L16 10" />
    <path d="m10 22 2-7 2 7" />
  </svg>,
  // Comunidad / naturaleza — people + leaf
  <svg key="com" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>,
] as const;

export function PresencialRichSyllabus({
  program,
  mediaUrl,
  mediaAlt,
  mediaUrlB,
  mediaAltB,
  ctaHref,
  ctaLabel = "Inscribirme ahora",
}: Props) {
  const learn = findByTitle(
    program,
    (t) =>
      t.toLowerCase().includes("aprenderás") ||
      t.toLowerCase().includes("desarrollarás") ||
      t.toLowerCase().includes("ejes de trabajo")
  );
  const panorama = findByTitle(program, (t) =>
    t.toLowerCase().startsWith("panorama")
  );
  const activism = findByTitle(program, (t) =>
    t.toLowerCase().includes("activismo")
  );
  const origin = findByTitle(program, (t) =>
    t.toLowerCase().includes("cómo nace")
  );
  const axes = findAll(program, (t) => /^\d+\./.test(t));
  const academic = findAll(
    program,
    (t) => t.startsWith("Online") || t.startsWith("Presencial")
  );

  return (
    <section
      className="presencial-rich"
      aria-labelledby="presencial-rich-title"
    >
      <header className="presencial-rich__masthead">
        <h2 id="presencial-rich-title">Ver programa completo</h2>
        <a
          href="#presencial-rich-body"
          className="presencial-rich__scroll"
          aria-label="Bajar al programa completo"
        >
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden>
            <path
              d="M6 9l6 6 6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </header>

      <div id="presencial-rich-body" className="presencial-rich__body">

      {/* PDF p.1 — diagrama 5 ejes */}
      <div className="presencial-rich__panel presencial-rich__panel--intro">
        <div className="presencial-rich__intro-grid">
          <LongevidadMindMap />
        </div>
      </div>

      {origin?.items?.length ? (
        <StorySplit
          title={origin.title}
          items={origin.items}
          mediaUrl="/img/Programa-activo-de-autonomia-motriz-y-funcional-en-adultos-mayores-cba-extendido.webp"
          mediaAlt="Programa activo de autonomía motriz en adultos mayores"
        />
      ) : null}

      {activism?.items?.length ? (
        <StorySplit
          title={activism.title}
          items={activism.items}
          mediaUrl="/img/Programa-activo-de-autonomia-motriz-y-funcional-en-adultos-mayores-cba-4.webp"
          mediaAlt="Activismo gerontológico y adultos mayores en movimiento"
          flip
          plain
        />
      ) : null}

      {learn?.items?.length ? (
        <div className="presencial-rich__panel presencial-rich__panel--learn">
          <div className="presencial-rich__bento">
            <article className="presencial-rich__bento-card presencial-rich__bento-card--lead">
              <p className="presencial-rich__bento-lead-title">{learn.title}</p>
            </article>
            {learn.items.map((item, i) => (
              <article
                key={item}
                className={`presencial-rich__bento-card presencial-rich__bento-card--${i + 1}`}
              >
                <span className="presencial-rich__bento-icon" aria-hidden>
                  {LEARN_ICONS[i]}
                </span>
                <h4>{item}</h4>
              </article>
            ))}
            {(mediaUrlB || mediaUrl) ? (
              <article
                className="presencial-rich__bento-card presencial-rich__bento-card--media"
                style={{
                  backgroundImage: `url("${mediaUrlB || mediaUrl}")`,
                }}
                role="img"
                aria-label={mediaAltB || mediaAlt || ""}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {SHOW_PANORAMA && panorama?.items?.length ? (
        <div className="presencial-rich__panel presencial-rich__panel--panorama">
          <div className="presencial-rich__panorama">
            <span className="presencial-rich__panorama-mark" aria-hidden>
              +65
            </span>
            <div className="presencial-rich__panorama-copy">
              <h3>{panorama.title}</h3>
              {panorama.items.map((p, i) => (
                <p
                  key={p}
                  className={
                    i === 0 ? "presencial-rich__panorama-lead" : undefined
                  }
                >
                  {p}
                </p>
              ))}
            </div>
            {mediaUrl ? (
              <div className="presencial-rich__panorama-media">
                <span className="presencial-rich__panorama-line" aria-hidden />
                <div
                  className="presencial-rich__visual"
                  style={{ backgroundImage: `url("${mediaUrl}")` }}
                  role="img"
                  aria-label={mediaAlt || ""}
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {SHOW_MANIFESTO && (activism || origin) ? (
        <div className="presencial-rich__panel presencial-rich__panel--manifesto">
          <span className="presencial-rich__manifesto-mark" aria-hidden>
            ACTIVISMO
          </span>
          <div className="presencial-rich__manifesto">
            {activism ? (
              <article className="presencial-rich__manifesto-main">
                <h3>{activism.title}</h3>
                {activism.items?.map((p) => {
                  const pull =
                    "Frente al edadismo, abogamos por una visión empoderadora, funcional y de autonomía motriz.";
                  if (p.includes(pull)) {
                    const [before, after] = p.split(pull);
                    return (
                      <p key={p}>
                        {before}
                        <span className="presencial-rich__pull">{pull}</span>
                        {after}
                      </p>
                    );
                  }
                  return <p key={p}>{p}</p>;
                })}
              </article>
            ) : null}
            {origin ? (
              <article className="presencial-rich__manifesto-side">
                <h3>{origin.title}</h3>
                {origin.items?.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </article>
            ) : null}
          </div>
        </div>
      ) : null}

      {SHOW_AXES && axes.length > 0 ? <AxesEditorial axes={axes} /> : null}

      {academic.length > 0 ? (
        <div className="presencial-rich__panel presencial-rich__panel--agenda">
          <div className="presencial-rich__agenda-head">
            <h3 className="presencial-rich__section-title">Programa Académico</h3>
            <p className="presencial-rich__section-lead">
              Formación híbrida: 2 jornadas online y 3 días presenciales en
              Córdoba, Argentina.
            </p>
          </div>
          <div className="presencial-rich__agenda">
            {academic.map((day, index) => {
              const { kind, label, hours, professors } = dayMeta(day.title);
              const kindKey = (kind || "evento").toLowerCase();
              const when = dayWhen(label, hours);
              return (
                <article
                  key={day.title}
                  className={`presencial-rich__day presencial-rich__day--${kindKey} presencial-rich__day--step-${index + 1}`}
                >
                  <div className="presencial-rich__day-rail" aria-hidden>
                    <span className="presencial-rich__day-node" />
                  </div>
                  <div className="presencial-rich__day-main">
                    <header className="presencial-rich__day-meta">
                      {kind ? (
                        <span
                          className={`presencial-rich__day-kind presencial-rich__day-kind--${kindKey}`}
                        >
                          {kind}
                        </span>
                      ) : null}
                      {when ? (
                        <h4 className="presencial-rich__day-when">{when}</h4>
                      ) : null}
                      {professors ? (
                        <span className="presencial-rich__day-profs">
                          {professors}
                        </span>
                      ) : null}
                    </header>
                    <ul className="presencial-rich__day-body">
                      {day.items?.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>
          {ctaHref ? (
            <div className="presencial-rich__agenda-cta">
              <a href={ctaHref} className="hero-btn">
                {ctaLabel}
              </a>
            </div>
          ) : null}
        </div>
      ) : null}
      </div>

    </section>
  );
}
