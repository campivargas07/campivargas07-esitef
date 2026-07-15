import { SESIONES_ONLINE_FAQ } from "@/lib/sesiones-online-content";

export function SesionesOnlineFaqSection() {
  return (
    <section
      className="sesiones-online-faq"
      aria-labelledby="sesiones-online-faq-title"
    >
      <div className="sesiones-online-faq__inner">
        <h2 id="sesiones-online-faq-title" className="sesiones-online-faq__title">
          Preguntas frecuentes
        </h2>
        <div className="sesiones-online-faq__grid">
          {SESIONES_ONLINE_FAQ.map((item) => (
            <details key={item.question} className="sesiones-online-faq__item">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
