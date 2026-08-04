import type { PresencialProgramModule } from "@/lib/presenciales";
import { LongevidadMindMap } from "@/components/presencial/LongevidadMindMap";
import "@/styles/presencial-rich.css";

type Props = {
  program: PresencialProgramModule[];
  mediaUrl?: string;
  mediaAlt?: string;
  axesMediaUrl?: string;
  axesMediaAlt?: string;
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

function axisNumber(title: string): string {
  const m = title.match(/^(\d+)\./);
  return m?.[1] ?? "";
}

function axisLabel(title: string): string {
  return title.replace(/^\d+\.\s*/, "");
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

export function PresencialRichSyllabus({
  program,
  mediaUrl,
  mediaAlt,
  axesMediaUrl,
  axesMediaAlt,
  ctaHref,
  ctaLabel = "Inscribirme ahora",
}: Props) {
  const axesImage = axesMediaUrl || mediaUrl;
  const axesAlt = axesMediaAlt || mediaAlt;
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

      {/* PDF p.1 — mapa mental + intro */}
      <div className="presencial-rich__panel presencial-rich__panel--intro">
        <div className="presencial-rich__intro-grid">
          <LongevidadMindMap />
          <div className="presencial-rich__intro-copy">
            <p>
              En un contexto global donde la población adulta mayor crece y la
              esperanza de vida se expande, surge una necesidad ineludible:
              espacios de entrenamiento con visión de co-diseño, adaptación y
              generación de comunidad, que no sólo mejoren la calidad de vida de
              personas +65, sino que además permitan al profesional ampliar su
              perspectiva laboral y económica ofreciendo un servicio diferencial.
            </p>
            <p>
              Con una experiencia de más de 12 años y desde NUTA hemos
              desarrollado un programa original enfocado en personas mayores de
              65. El Programa Activo de Autonomía Motriz y Funcional en Adultos
              Mayores integra un enfoque riguroso de entrenamiento basado en
              capacidades y habilidades para la independencia motriz, actividades
              cognitivas, expresivas y lúdicas, posibilitando al mismo tiempo una
              comunidad presente, que sostiene y acompaña esta etapa de la vida.
            </p>
            <p>
              Es de destacar la alta adherencia, nivel de satisfacción y
              presencia incondicional de los participantes de este programa, lo
              que favorece que sea un proyecto sostenible a largo plazo. Y también
              es de destacar la viabilidad y rentabilidad económica que supone
              para todos, tanto para los participantes, que pagan menos que
              sesiones individuales, como para el profesional que lo guía al
              trabajar en grupo.
            </p>
          </div>
        </div>
      </div>

      {learn?.items?.length ? (
        <div className="presencial-rich__panel presencial-rich__panel--learn">
          <div className="presencial-rich__bento">
            <article className="presencial-rich__bento-card presencial-rich__bento-card--lead">
              <p className="presencial-rich__bento-lead-title">{learn.title}</p>
            </article>
            {learn.items.map((item, i) => {
              const titles = [
                "Evaluar",
                "Planificar",
                "Equipo y familia",
                "Redes de contención",
              ];
              return (
                <article
                  key={item}
                  className={`presencial-rich__bento-card presencial-rich__bento-card--${i + 1}`}
                >
                  <span className="presencial-rich__bento-num" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h4>{titles[i] ?? `Capacidad ${i + 1}`}</h4>
                  <p>{item}</p>
                </article>
              );
            })}
          </div>
        </div>
      ) : null}

      {panorama?.items?.length ? (
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

      {(activism || origin) && (
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
      )}

      {axes.length > 0 ? (
        <div className="presencial-rich__panel presencial-rich__panel--axes">
          <div className="presencial-rich__axes-intro">
            <h3>El programa consta de 5 ejes de trabajo</h3>
            <p>
              Cinco dimensiones complementarias del movimiento, la cognición y
              la comunidad.
            </p>
          </div>
          {/* Densidad: 01 featured → 02+imagen → trío 03/04/05 */}
          <div className="presencial-rich__axes">
            {([0, 1, "media", 2, 3, 4] as const).map((slot) => {
              if (slot === "media") {
                if (!axesImage) return null;
                return (
                  <figure
                    key="axes-media"
                    className="presencial-rich__axis presencial-rich__axis--media"
                  >
                    <img
                      src={axesImage}
                      alt={axesAlt || ""}
                      className="presencial-rich__axis-media-img"
                    />
                  </figure>
                );
              }
              const axis = axes[slot];
              if (!axis) return null;
              const [lead, ...rest] = axis.items ?? [];
              const n = String(axisNumber(axis.title) || slot + 1).padStart(
                2,
                "0"
              );
              return (
                <article
                  key={axis.title}
                  className={`presencial-rich__axis presencial-rich__axis--${slot + 1}`}
                >
                  <span className="presencial-rich__axis-n" aria-hidden>
                    {n}
                  </span>
                  <h4>{axisLabel(axis.title)}</h4>
                  {lead ? (
                    <p className="presencial-rich__axis-lead">{lead}</p>
                  ) : null}
                  {rest.length > 0 ? (
                    <ul>
                      {rest.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      ) : null}

      {academic.length > 0 ? (
        <div className="presencial-rich__panel presencial-rich__panel--agenda">
          <div className="presencial-rich__agenda-head">
            <h3 className="presencial-rich__section-title">Programa Académico</h3>
            <p className="presencial-rich__section-lead">
              Formación híbrida: dos jornadas online y tres días presenciales en
              Córdoba.
            </p>
          </div>
          <div className="presencial-rich__agenda">
            {academic.map((day, index) => {
              const { kind, label, hours, professors } = dayMeta(day.title);
              const kindKey = (kind || "evento").toLowerCase();
              return (
                <article
                  key={day.title}
                  className={`presencial-rich__day presencial-rich__day--${kindKey} presencial-rich__day--step-${index + 1}`}
                >
                  <div className="presencial-rich__day-rail" aria-hidden>
                    <span className="presencial-rich__day-node" />
                    {index < academic.length - 1 ? (
                      <span className="presencial-rich__day-advance">↓</span>
                    ) : null}
                  </div>
                  <header className="presencial-rich__day-meta">
                    {kind ? (
                      <span
                        className={`presencial-rich__day-kind presencial-rich__day-kind--${kindKey}`}
                      >
                        {kind}
                      </span>
                    ) : null}
                    <h4>{label}</h4>
                    {hours ? (
                      <span className="presencial-rich__day-hours">{hours}</span>
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
