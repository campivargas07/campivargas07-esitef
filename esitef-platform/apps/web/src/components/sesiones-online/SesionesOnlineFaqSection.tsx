"use client";

import { HubAccordion } from "@/components/formaciones/HubAccordion";
import { SESIONES_ONLINE_FAQ } from "@/lib/sesiones-online-content";

export function SesionesOnlineFaqSection() {
  return (
    <section
      className="hub-faq sesiones-online-faq"
      aria-labelledby="sesiones-online-faq-title"
    >
      <div className="hub-faq__inner">
        <h2 id="sesiones-online-faq-title" className="hub-faq__title">
          Preguntas frecuentes
        </h2>
        <HubAccordion
          className="hub-faq__list accordion-container hub-faq__list--cols-2"
          items={SESIONES_ONLINE_FAQ.map((item) => ({
            title: item.question,
            content: item.answer,
          }))}
        />
      </div>
    </section>
  );
}
