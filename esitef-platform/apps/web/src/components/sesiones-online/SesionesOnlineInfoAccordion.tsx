"use client";

import { useState } from "react";
import { SESIONES_ONLINE_INFO_ACCORDION } from "@/lib/sesiones-online-content";

export function SesionesOnlineInfoAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="hub-planning hub-planning--accordion sesiones-online-planning">
      <div className="accordion-container">
        {SESIONES_ONLINE_INFO_ACCORDION.map((item, i) => {
          const expanded = open === i;
          return (
            <div
              key={item.title}
              className={`accordion-item${expanded ? " active" : ""}`}
            >
              <button
                type="button"
                className="accordion-header"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? null : i)}
              >
                <span>{item.title}</span>
                <span className="accordion-icon" aria-hidden="true">
                  +
                </span>
              </button>
              <div className="accordion-content">
                <div className="accordion-content-inner">
                  <ul className="hub-planning__list">
                    {item.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                  {item.footer && (
                    <p className="sesiones-online-planning__footer">{item.footer}</p>
                  )}
                  <a
                    href={item.href}
                    className="sesiones-online-planning__link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver más en esitef.com
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
