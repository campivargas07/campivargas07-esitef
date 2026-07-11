import Link from "next/link";

const FAQ_ITEMS = [
  {
    q: "¿Cómo me inscribo a una formación online?",
    a: "Regístrate en la plataforma, elige el curso en Formaciones y completa el pago con tarjeta (Stripe) o PayPal. Tras confirmar el pago recibirás acceso al contenido.",
  },
  {
    q: "¿Cómo reservo una sesión online con Tomás?",
    a: "Visita la página de Sesiones online y escríbenos desde el formulario de contacto indicando tu caso. Te responderemos para coordinar fecha y modalidad.",
  },
  {
    q: "¿Qué métodos de pago aceptan las formaciones presenciales?",
    a: "Depende del curso: algunas sedes permiten reserva, pago en cuotas o pago completo online (Stripe). Otras usan transferencia bancaria y WhatsApp — los datos aparecen en la ficha del curso.",
  },
  {
    q: "¿Puedo usar mi cuenta de WordPress / ESITEF Online anterior?",
    a: "Sí. Durante la migración tu email y contraseña de WordPress siguen siendo válidos. Si tienes problemas para entrar, usa la opción de recuperación o contacto.",
  },
  {
    q: "¿Dónde encuentro mis certificados?",
    a: "Una vez completado un curso con los requisitos de certificación, accede desde tu panel o la ruta de certificados asociada al curso.",
  },
  {
    q: "¿Cómo solicito un taller privado para mi clínica?",
    a: "Escribe a info@esitef.com o por WhatsApp desde la página Talleres privados. Indica ubicación, número de asistentes y teléfono de contacto.",
  },
];

export function PreguntasFrecuentesContent() {
  return (
    <>
      <section className="servicio-hero" aria-label="Preguntas frecuentes">
        <div>
          <span className="eyebrow">Ayuda</span>
          <h1>Preguntas frecuentes</h1>
          <p className="lead">
            Respuestas rápidas sobre formaciones online, presenciales, sesiones
            con Tomás y pagos.
          </p>
        </div>
      </section>

      <section className="servicio-section faq-list">
        {FAQ_ITEMS.map((item) => (
          <details key={item.q} className="faq-item">
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </section>

      <section className="servicio-cta">
        <p className="contact-hint">
          ¿No encuentras lo que buscas?{" "}
          <Link href="/contacto">Escríbenos desde contacto</Link>.
        </p>
      </section>
    </>
  );
}
