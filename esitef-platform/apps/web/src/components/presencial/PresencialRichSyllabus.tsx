import type { PresencialProgramModule } from "@/lib/presenciales";
import { AxesEditorial } from "@/components/presencial/AxesEditorial";
import { LongevidadMindMap } from "@/components/presencial/LongevidadMindMap";
import "@/styles/presencial-rich.css";

/** ponytail: pausa temporal — poner en true para reactivar */
const SHOW_PANORAMA = false;
const SHOW_MANIFESTO = false;

type Props = {
  program: PresencialProgramModule[];
  mediaUrl?: string;
  mediaAlt?: string;
  /** Misma acción que el CTA del hero */
  ctaHref?: string;
  ctaLabel?: string;
};

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
  const hoursMatch = title.match(/\(([^)]+)\)/);
  const hours = hoursMatch?.[1] ?? "";
  const professorsMatch = title.match(/\)\s*[—-]\s*(.+)$/);
  const professors = professorsMatch?.[1]?.trim() ?? "";
  const kind = title.startsWith("Online")
    ? "Online"
    : title.startsWith("Presencial")
      ? "Presencial"
      : "";
  const label = title
    .replace(/^Online\s*[—-]\s*/i, "")
    .replace(/^Presencial\s*[—-]\s*/i, "")
    .replace(/\s*\([^)]*\).*$/, "")
    .trim();
  return { kind, label, hours, professors };
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
  // Evaluar — clipboard check
  <svg key="eval" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="m9 14 2 2 4-4" />
  </svg>,
  // Planificar — layout / roadmap
  <svg key="plan" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M3 10h18" />
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <path d="M8 14h.01" />
    <path d="M12 14h.01" />
    <path d="M16 14h.01" />
    <path d="M8 18h.01" />
    <path d="M12 18h.01" />
  </svg>,
  // Equipo y familia — people
  <svg key="team" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>,
  // Redes de contención — connected nodes
  <svg key="net" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="5" cy="6" r="2.5" />
    <circle cx="19" cy="6" r="2.5" />
    <circle cx="12" cy="18" r="2.5" />
    <path d="M7.2 7.5 10.5 16" />
    <path d="M16.8 7.5 13.5 16" />
    <path d="M7.5 6h9" />
  </svg>,
] as const;

export function PresencialRichSyllabus({
  program,
  mediaUrl,
  mediaAlt,
  ctaHref,
  ctaLabel = "Inscribirme ahora",
}: Props) {
  const learn = findByTitle(
    program,
    (t) =>
      t.toLowerCase().includes("aprenderás") ||
      t.toLowerCase().includes("desarrollarás")
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
                <p>{item}</p>
              </article>
            ))}
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

      {axes.length > 0 ? <AxesEditorial axes={axes} /> : null}

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
