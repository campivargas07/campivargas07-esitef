import Image from "next/image";

const INSTRUCTOR_AVATAR = "/img/Tomas_Bonino.jpg";

export function LandingHighlights() {
  return (
    <section className="landing-highlights" aria-label="Detalles del curso">
      <div className="landing-highlights__panel">
        <div className="landing-highlight-row">
          <div
            className="landing-highlight-row__icon landing-highlight-row__icon--star"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div className="landing-highlight-row__text">
            <strong className="landing-highlight-row__title">
              Sin valoraciones
            </strong>
            <span className="landing-highlight-row__label">Ranking</span>
          </div>
        </div>

        <div className="landing-highlight-row">
          <div className="landing-highlight-row__icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div className="landing-highlight-row__text">
            <strong className="landing-highlight-row__title">100% online</strong>
            <span className="landing-highlight-row__label">
              Aprende a tu ritmo, desde donde quieras
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingInstructor() {
  return (
    <section
      className="landing-section landing-instructor"
      aria-labelledby="landing-instructor-title"
    >
      <h2 id="landing-instructor-title" className="landing-section__title">
        Profesor
      </h2>
      <article className="landing-instructor-card">
        <div className="landing-instructor-card__avatar">
          <Image
            src={INSTRUCTOR_AVATAR}
            alt="Tomás Bonino"
            width={176}
            height={176}
            unoptimized
          />
        </div>
        <h3>Tomás Bonino</h3>
        <span className="landing-instructor-card__role">
          Director ESITEF · Fisioterapeuta
        </span>
        <div className="landing-instructor-card__bio">
          <p>
            Formador internacional en ejercicio terapéutico y movement coaching.
            Más de 15 años formando a profesionales de la salud en Latinoamérica
            y Europa.
          </p>
        </div>
      </article>
    </section>
  );
}
