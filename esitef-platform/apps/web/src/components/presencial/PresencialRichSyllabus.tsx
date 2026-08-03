import type { PresencialProgramModule } from "@/lib/presenciales";
import "@/styles/presencial-rich.css";

type Props = {
  pdfUrl?: string;
  program: PresencialProgramModule[];
  mediaUrl?: string;
  mediaAlt?: string;
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

function dayMeta(title: string): { kind: string; label: string; hours: string } {
  const hoursMatch = title.match(/\(([^)]+)\)/);
  const hours = hoursMatch?.[1] ?? "";
  const kind = title.startsWith("Online")
    ? "Online"
    : title.startsWith("Presencial")
      ? "Presencial"
      : "";
  const label = title
    .replace(/^Online\s*[—-]\s*/i, "")
    .replace(/^Presencial\s*[—-]\s*/i, "")
    .replace(/\s*\([^)]+\)\s*$/, "")
    .trim();
  return { kind, label, hours };
}

export function PresencialRichSyllabus({
  pdfUrl,
  program,
  mediaUrl,
  mediaAlt,
}: Props) {
  const learn = findByTitle(program, (t) =>
    t.toLowerCase().includes("aprenderás")
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
        <p className="presencial-rich__kicker">Programa completo</p>
        <div className="presencial-rich__masthead-row">
          <h2 id="presencial-rich-title">Ver programa completo</h2>
          {pdfUrl ? (
            <a
              href={pdfUrl}
              className="presencial-rich__pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              Descargar PDF
              <span aria-hidden>→</span>
            </a>
          ) : null}
        </div>
      </header>

      {learn?.items?.length ? (
        <div className="presencial-rich__panel">
          <div className="presencial-rich__panel-top">
            <span className="presencial-rich__badge">La formación</span>
            <span className="presencial-rich__panel-tag">Resultados</span>
          </div>
          <div className="presencial-rich__split presencial-rich__split--learn">
            <div className="presencial-rich__split-copy">
              <h3>{learn.title}</h3>
              <p className="presencial-rich__hint">
                Cuatro capacidades concretas para implementar el programa +65
                en tu práctica.
              </p>
            </div>
            <ol className="presencial-rich__pillars">
              {learn.items.map((item, i) => (
                <li key={item} className="presencial-rich__pillar">
                  <span className="presencial-rich__pillar-num" aria-hidden>
                    {i + 1}
                  </span>
                  <p>{item}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : null}

      {panorama?.items?.length ? (
        <div className="presencial-rich__panel">
          <div className="presencial-rich__panel-top">
            <span className="presencial-rich__badge">Contexto</span>
            <span className="presencial-rich__panel-tag">Longevidad</span>
          </div>
          <div className="presencial-rich__split presencial-rich__split--panorama">
            <div className="presencial-rich__split-copy">
              <h3>{panorama.title}</h3>
              {panorama.items.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            {mediaUrl ? (
              <div
                className="presencial-rich__visual"
                style={{ backgroundImage: `url("${mediaUrl}")` }}
                role="img"
                aria-label={mediaAlt || ""}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {(activism || origin) && (
        <div className="presencial-rich__panel">
          <div className="presencial-rich__panel-top">
            <span className="presencial-rich__badge">Fundamentos</span>
            <span className="presencial-rich__panel-tag">Programa +65</span>
          </div>
          <div className="presencial-rich__duo">
            {activism ? (
              <article className="presencial-rich__prose">
                <h3>{activism.title}</h3>
                {activism.items?.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </article>
            ) : null}
            {origin ? (
              <article className="presencial-rich__prose presencial-rich__prose--accent">
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
        <div className="presencial-rich__panel">
          <div className="presencial-rich__panel-top">
            <span className="presencial-rich__badge">Método</span>
            <span className="presencial-rich__panel-tag">5 ejes</span>
          </div>
          <div className="presencial-rich__axes-intro">
            <h3>El programa consta de 5 ejes de trabajo</h3>
            <p>
              Cinco dimensiones complementarias del movimiento, la cognición y
              la comunidad.
            </p>
          </div>
          <ol className="presencial-rich__timeline">
            {axes.map((axis) => {
              const [lead, ...rest] = axis.items ?? [];
              return (
                <li key={axis.title} className="presencial-rich__timeline-item">
                  <span className="presencial-rich__timeline-dot" aria-hidden>
                    {axisNumber(axis.title)}
                  </span>
                  <div className="presencial-rich__timeline-body">
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
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}

      {academic.length > 0 ? (
        <div className="presencial-rich__panel">
          <div className="presencial-rich__panel-top">
            <span className="presencial-rich__badge">Agenda</span>
            <span className="presencial-rich__panel-tag">8 h + 20 h</span>
          </div>
          <h3 className="presencial-rich__section-title">Programa Académico</h3>
          <p className="presencial-rich__section-lead">
            Formación híbrida: dos jornadas online y tres días presenciales en
            Córdoba.
          </p>
          <div className="presencial-rich__agenda">
            {academic.map((day) => {
              const { kind, label, hours } = dayMeta(day.title);
              return (
                <article key={day.title} className="presencial-rich__day">
                  <header>
                    {kind ? (
                      <span
                        className={`presencial-rich__day-kind presencial-rich__day-kind--${kind.toLowerCase()}`}
                      >
                        {kind}
                      </span>
                    ) : null}
                    <h4>{label}</h4>
                    {hours ? (
                      <span className="presencial-rich__day-hours">{hours}</span>
                    ) : null}
                  </header>
                  <ul>
                    {day.items?.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      ) : null}

      {pdfUrl ? (
        <div className="presencial-rich__footer">
          <a
            href={pdfUrl}
            className="presencial-rich__pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            Descargar dossier en PDF
            <span aria-hidden>→</span>
          </a>
        </div>
      ) : null}
    </section>
  );
}
