"use client";

import { useState } from "react";
import { SESIONES_ONLINE_INFO_ACCORDION } from "@/lib/sesiones-online-content";

export function SesionesOnlineInfoAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="sesiones-online-info-accordion">
      {SESIONES_ONLINE_INFO_ACCORDION.map((item, i) => {
        const expanded = open === i;
        return (
          <div
            key={item.title}
            className={[
              "sesiones-online-info-accordion__item",
              expanded && "sesiones-online-info-accordion__item--open",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <button
              type="button"
              className="sesiones-online-info-accordion__trigger"
              aria-expanded={expanded}
              onClick={() => setOpen(expanded ? null : i)}
            >
              <span>{item.title}</span>
              <span className="sesiones-online-info-accordion__icon" aria-hidden>
                +
              </span>
            </button>
            <div className="sesiones-online-info-accordion__panel">
              <div className="sesiones-online-info-accordion__panel-inner">
                <ul>
                  {item.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
                {item.footer && <p>{item.footer}</p>}
                <a
                  href={item.href}
                  className="sesiones-online-info-accordion__link"
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
  );
}
