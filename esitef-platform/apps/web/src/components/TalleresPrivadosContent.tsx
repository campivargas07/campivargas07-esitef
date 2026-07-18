const HERO_IMG =
  "/img/Evaluacion-funcional-rodilla.png";

const WHATSAPP = "5493562670042";

export function TalleresPrivadosContent() {
  return (
    <>
      <section className="servicio-hero" aria-label="Talleres privados para clínicas">
        <div>
          <span className="eyebrow">Formación in-company</span>
          <h1>Talleres privados clínicas / Instituciones</h1>
          <p className="lead">
            Queremos ayudar y asesorar a los centros y clínicas a mejorar su
            calidad asistencial de forma personalizada.
          </p>
        </div>
        <div className="servicio-hero-media">
          <img src={HERO_IMG} alt="Taller privado en clínica" />
        </div>
      </section>

      <section className="servicio-section">
        <p>
          Se trata de dedicar una o media jornada en la que se realiza, en tu
          propio centro, un taller privado para los trabajadores, enfocándonos en
          analizar, dar ideas y proponer nuevo enfoques terapéuticos prácticos en
          base a la casuística habitual de ese centro en particular.
        </p>

        <h2>¿Cómo es el taller?</h2>
        <p>
          Un profesional ESITEF (de muy amplia experiencia clínica y gran
          actualización) acudirá a tu centro. Los propios trabajadores de la
          clínica podrán proponer casos clínicos y/o traerán pacientes reales,
          para que juntos podamos orientar y aportar maneras nuevas y diferentes
          de abordaje de esos casos.
        </p>

        <h2>¿Cómo hago para que vengan a mi clínica?</h2>
        <p>
          Escríbenos a{" "}
          <a href="mailto:info@esitef.com">info@esitef.com</a>, o al WhatsApp{" "}
          <a
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            +54 9 3562 670042
          </a>{" "}
          indicándonos la localización de tu centro, el número de posibles
          asistentes al taller y tu teléfono. Nos pondremos en contacto contigo.
        </p>
      </section>

      <section className="servicio-cta">
        <a href="mailto:info@esitef.com" className="btn-servicio">
          Solicitar taller
        </a>
        <p className="contact-hint">
          También puedes escribir por{" "}
          <a
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
          .
        </p>
      </section>
    </>
  );
}
