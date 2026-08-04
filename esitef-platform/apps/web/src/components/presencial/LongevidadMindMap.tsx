"use client";

import { useEffect, useRef } from "react";

/** Flower / Venn mind-map of the 5 program axes (PDF p.1). */
const PETALS = [
  {
    label: "Entrenamiento basal",
    color: "#6eb0d6",
    angle: -90,
  },
  {
    label: "Manipulación de objetos",
    color: "#3d6fb8",
    angle: -18,
  },
  {
    label: "Movimiento expresivo, rítmico y creativo",
    color: "#e8c84a",
    angle: 54,
  },
  {
    label: "Consciencia somática / Inteligencia biológica",
    color: "#e08a3c",
    angle: 126,
  },
  {
    label: "Comunidad, relación con el entorno y naturaleza",
    color: "#d45a5a",
    angle: 198,
  },
] as const;

const CX = 200;
const CY = 200;
const R = 82;
const DIST = 74;
const LABEL_DIST = 108;

function polar(angleDeg: number, dist: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + dist * Math.cos(rad), y: CY + dist * Math.sin(rad) };
}

export function LongevidadMindMap() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      root.classList.add("is-inview");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            io.unobserve(entry.target);
          }
        }
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.35 }
    );

    io.observe(root);
    return () => io.disconnect();
  }, []);

  return (
    <figure
      ref={rootRef}
      className="longevidad-mindmap"
      aria-label="Mapa mental de los cinco ejes del programa"
    >
      <svg
        className="longevidad-mindmap__svg"
        viewBox="0 0 400 400"
        role="img"
        aria-labelledby="longevidad-mindmap-title"
      >
        <title id="longevidad-mindmap-title">
          Programa activo de autonomía motriz y funcional — Longevidad en
          movimiento
        </title>

        {/* One petal at a time: fill+stroke so later fills cover earlier strokes (Venn). */}
        {PETALS.map((petal, i) => {
          const { x, y } = polar(petal.angle, DIST);
          const startRot = petal.angle + 180;
          return (
            <circle
              key={`c-${petal.label}`}
              className="longevidad-mindmap__petal"
              style={{ ["--i" as string]: i }}
              cx={x}
              cy={y}
              r={R}
              fill="#ffffff"
              fillOpacity={0.78}
              stroke={petal.color}
              strokeWidth={3.25}
              strokeLinecap="round"
              pathLength={1}
              transform={`rotate(${startRot} ${x} ${y})`}
            />
          );
        })}

        <g className="longevidad-mindmap__hub-g">
          <circle
            className="longevidad-mindmap__hub-circle"
            cx={CX}
            cy={CY}
            r={70}
            fill="#ffffff"
            stroke="#c8c8c8"
            strokeWidth={2}
          />

          <foreignObject x={CX - 60} y={CY - 44} width={120} height={88}>
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              className="longevidad-mindmap__hub"
            >
              <strong>
                Programa activo de autonomía motriz y funcional en adultos
                mayores
              </strong>
              <span>Longevidad en movimiento</span>
            </div>
          </foreignObject>
        </g>

        {PETALS.map((petal, i) => {
          const { x, y } = polar(petal.angle, LABEL_DIST);
          return (
            <foreignObject
              key={`l-${petal.label}`}
              x={x - 54}
              y={y - 36}
              width={108}
              height={72}
            >
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                className="longevidad-mindmap__petal-label"
                style={{ ["--i" as string]: i }}
              >
                {petal.label}
              </div>
            </foreignObject>
          );
        })}
      </svg>
    </figure>
  );
}
