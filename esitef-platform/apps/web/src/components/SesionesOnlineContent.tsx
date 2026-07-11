import Link from "next/link";

const HERO_IMG =
  "https://esitef.com/online/wp-content/uploads/2022/05/sesiones-online-fisioterapia-.png";

export function SesionesOnlineContent() {
  return (
    <>
      <section className="servicio-hero" aria-label="Sesiones online con Tomás Bonino">
        <div>
          <span className="eyebrow">Atención personalizada</span>
          <h1>Sesiones online con Tomás Bonino</h1>
          <p className="lead">
            Consultas y sesiones online para aplicar el ejercicio terapéutico con
            tus pacientes, o para orientarte como profesional en casos clínicos
            complejos.
          </p>
        </div>
        <div className="servicio-hero-media">
          <img src={HERO_IMG} alt="Sesiones online con Tomás Bonino" />
        </div>
      </section>

      <section className="servicio-section">
        <h2>Para pacientes y deportistas</h2>
        <p>
          Si quieres tener consciencia de tu estado, deseas tomar el control de tu
          propia situación y estás dispuesto/a a trabajar activamente por superar
          definitivamente tu problema y mejorar, Tomás estará feliz de ayudarte y
          guiarte en ese proceso.
        </p>
        <p>
          Tomás te escuchará y atenderá de forma personalizada y directa evaluando
          tu situación, ayudándote a entender qué te ocurre y por qué. Y te guiará
          en el camino terapéutico y/o de optimización del movimiento más adecuado
          para ti.
        </p>
        <p>
          Veremos el nivel de tus capacidades, analizaremos tus debilidades y
          trabajaremos en adecuarlas a tus necesidades y demandas (ya seas desde
          sedentario hasta deportista profesional) creando un plan accesible y
          realista para ti.
        </p>
      </section>

      <section className="servicio-section">
        <h2>Si eres un profesional de la salud o del movimiento</h2>
        <p>
          Tomás podrá ayudarte y asesorarte a orientar de una mejor manera el
          trabajo con tu paciente o cliente.
        </p>
        <div className="servicio-cards">
          <article className="servicio-card">
            <h3>Opción 1: Interconsulta</h3>
            <p>
              Será estupendo que Tomás vea a tu paciente, cliente o alumno en
              directo en tu presencia en una sesión a 3, para poder trabajar en
              equipo y orientarte.
            </p>
          </article>
          <article className="servicio-card">
            <h3>Opción 2: Supervisión de casos</h3>
            <p>
              Puedes usar la sesión para contarle a Tomás casos que creas que él
              te puede guiar. Trae videos, historia clínica y tu accionar para
              poder orientarte en el pensamiento clínico-abordaje de movimiento
              de ese caso.
            </p>
          </article>
        </div>
      </section>

      <section className="servicio-section">
        <h2>¿Qué haremos en una terapia online?</h2>
        <p>
          Evaluación funcional orientada al movimiento, análisis de tus patrones
          motores y diseño de un plan de trabajo progresivo adaptado a tu contexto
          — ya sea rehabilitación, prevención o rendimiento deportivo.
        </p>
        <h2>¿Qué es coaching de movimiento?</h2>
        <p>
          Un acompañamiento para optimizar cómo te mueves, corrigiendo
          compensaciones y mejorando la eficiencia del gesto motor en la vida
          diaria o en el deporte.
        </p>
      </section>

      <section className="servicio-cta">
        <Link href="/contacto" className="btn-servicio">
          Reserva aquí
        </Link>
        <p className="contact-hint">
          Escríbenos desde el formulario de contacto indicando que deseas una
          sesión online.
        </p>
      </section>
    </>
  );
}
