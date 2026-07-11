import Link from "next/link";
import { PAISES } from "@/lib/navigation";
import "@/styles/la-escuela.css";

const VALORES = [
  {
    title: "Práctico",
    text: "Vamos a lo concreto, necesario y útil. Lo que aprendes se usa: herramientas que aplicas desde el primer día con tus pacientes y deportistas.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden>
        <path d="M12 2 2 7l10 5 10-5-10-5Z" />
        <path d="m2 17 10 5 10-5" />
        <path d="m2 12 10 5 10-5" />
      </svg>
    ),
  },
  {
    title: "Riguroso",
    text: "Formación basada en la última evidencia disponible, con docentes de referencia internacional y un nivel de postgrado y especialización exigente.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden>
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    title: "Internacional",
    text: "Más de 30 sedes en 8 países y una comunidad de profesionales que crece cada año junto a instituciones universitarias y asociativas.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
      </svg>
    ),
  },
];

export default function LaEscuelaPage() {
  return (
    <>
      <section className="escuela-hero" aria-label="La Escuela ESITEF">
        <div className="escuela-hero-text">
          <span className="eyebrow">Desde 2007</span>
          <h1>
            Te ayudamos a <strong>crecer</strong>
          </h1>
          <p className="lead">
            Somos la escuela de formación para profesionales de salud y deporte de
            mayor crecimiento internacional. Formamos a fisioterapeutas, médicos del
            deporte y profesionales de la salud con un enfoque práctico y riguroso.
          </p>
        </div>

        <div className="escuela-hero-media">
          <img
            src="https://esitef.com/online/wp-content/uploads/2022/12/esitef-inicio4-escuela-de-fisioterapia.webp"
            alt="Profesionales de salud en formación ESITEF"
          />
          <div className="hero-float-badge">
            <span className="num">18</span>
            <span className="txt">
              años formando
              <br />
              profesionales
            </span>
          </div>
        </div>
      </section>

      <section className="stats-section" aria-label="Cifras de ESITEF">
        <div className="stats-inner">
          <div className="stat-item">
            <div className="stat-num">2007</div>
            <div className="stat-label">Año de fundación</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">30+</div>
            <div className="stat-label">Sedes formativas</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">8</div>
            <div className="stat-label">Países</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">∞</div>
            <div className="stat-label">Compromiso con la práctica</div>
          </div>
        </div>
      </section>

      <section className="presencia-section" aria-label="Presencia internacional">
        <p className="section-eyebrow">Presencia internacional</p>
        <h2 className="section-title">Una red que crece en 8 países</h2>
        <p className="body-text">
          Disponemos de más de 30 sedes formativas permanentes en las que ofrecemos,
          junto a instituciones universitarias, asociativas y de atención a pacientes,
          formación de postgrado y de especialización de alta calidad — tanto
          presencial como online.
        </p>
        <div className="country-chips">
          {PAISES.map((pais) => (
            <Link key={pais.slug} className="country-chip" href={`/${pais.slug}`}>
              {pais.title}
            </Link>
          ))}
          <span className="country-chip country-chip--more">+ más</span>
        </div>
      </section>

      <section className="valores-section" aria-label="Nuestro enfoque">
        <div className="valores-head">
          <p className="section-eyebrow">Nuestro enfoque</p>
          <h2 className="section-title">Cómo formamos</h2>
        </div>

        <div className="valores-grid">
          {VALORES.map((valor) => (
            <div key={valor.title} className="valor-card">
              <div className="valor-icon">{valor.icon}</div>
              <h3>{valor.title}</h3>
              <p>{valor.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="manifiesto-section" aria-label="Manifiesto ESITEF">
        <div className="manifiesto-card">
          <span className="quote-mark">“</span>
          <p>Vamos a lo concreto, necesario, útil y que se usa.</p>
        </div>
      </section>
    </>
  );
}
