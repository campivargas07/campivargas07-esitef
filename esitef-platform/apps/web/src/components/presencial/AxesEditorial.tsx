"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { PresencialProgramModule } from "@/lib/presenciales";

type Props = {
  axes: PresencialProgramModule[];
};

function axisNumber(title: string): string {
  const m = title.match(/^(\d+)\./);
  return m?.[1] ?? "";
}

function axisLabel(title: string): string {
  return title.replace(/^\d+\.\s*/, "");
}

export function AxesEditorial({ axes }: Props) {
  const uid = useId().replace(/:/g, "");
  const [active, setActive] = useState(0);
  const clicking = useRef(false);
  const ids = useMemo(
    () => axes.map((_, i) => `presencial-eje-${uid}-${i + 1}`),
    [axes, uid]
  );

  useEffect(() => {
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (nodes.length === 0) return;

    const update = () => {
      if (clicking.current) return;
      const offset = 140;
      let current = 0;
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].getBoundingClientRect().top <= offset) current = i;
      }
      setActive(current);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ids]);

  const goTo = (index: number) => {
    const el = document.getElementById(ids[index]);
    if (!el) return;
    clicking.current = true;
    setActive(index);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      clicking.current = false;
    }, 700);
  };

  return (
    <div className="presencial-rich__panel presencial-rich__panel--axes">
      <div className="presencial-rich__axes-layout">
        <aside className="presencial-rich__axes-nav" aria-label="Ejes del programa">
          <h3 id={`axes-title-${uid}`} className="presencial-rich__axes-title">
            El programa consta
            <br />
            de 5 ejes de trabajo
          </h3>
          <ol className="presencial-rich__axes-toc">
            {axes.map((axis, i) => {
              const n = String(axisNumber(axis.title) || i + 1).padStart(2, "0");
              const isActive = active === i;
              return (
                <li key={axis.title}>
                  <button
                    type="button"
                    className={`presencial-rich__axes-toc-btn${isActive ? " is-active" : ""}`}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => goTo(i)}
                  >
                    <span className="presencial-rich__axes-toc-n" aria-hidden>
                      {n}
                    </span>
                    <span className="presencial-rich__axes-toc-label">
                      {axisLabel(axis.title)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        <div className="presencial-rich__axes-stream">
          {axes.map((axis, index) => {
            const [lead, ...rest] = axis.items ?? [];
            const n = String(axisNumber(axis.title) || index + 1).padStart(
              2,
              "0"
            );
            return (
              <article
                key={axis.title}
                id={ids[index]}
                className={`presencial-rich__axis presencial-rich__axis--${index + 1}`}
              >
                <span className="presencial-rich__axis-n" aria-hidden>
                  {n}
                </span>
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
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
