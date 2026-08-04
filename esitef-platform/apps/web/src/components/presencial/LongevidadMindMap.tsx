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
  return (
    <figure
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

        {PETALS.map((petal) => {
          const { x, y } = polar(petal.angle, DIST);
          return (
            <circle
              key={`c-${petal.label}`}
              cx={x}
              cy={y}
              r={R}
              fill="var(--esitef-card-bg, #ffffff)"
              fillOpacity={0.92}
              stroke={petal.color}
              strokeWidth={3.25}
            />
          );
        })}

        <circle
          cx={CX}
          cy={CY}
          r={70}
          fill="var(--esitef-card-bg, #ffffff)"
          stroke="#c8c8c8"
          strokeWidth={2}
        />

        <foreignObject x={CX - 60} y={CY - 44} width={120} height={88}>
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            className="longevidad-mindmap__hub"
          >
            <strong>
              Programa activo de autonomía motriz y funcional en adultos mayores
            </strong>
            <span>Longevidad en movimiento</span>
          </div>
        </foreignObject>

        {PETALS.map((petal) => {
          const { x, y } = polar(petal.angle, LABEL_DIST);
          return (
            <foreignObject
              key={`l-${petal.label}`}
              x={x - 54}
              y={y - 32}
              width={108}
              height={64}
            >
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                className="longevidad-mindmap__petal-label"
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
