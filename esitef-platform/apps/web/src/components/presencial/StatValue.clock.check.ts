/**
 * ponytail: assert StatValue schedule clock auto-prefix for ubicacion.
 * Run: npx tsx src/components/presencial/StatValue.clock.check.ts
 */

const CLOCK = '<span class="stat-inline-icon"';

function transform(value: string, statKey?: string): string {
  const clock =
    '<span class="stat-inline-icon" aria-hidden="true"><svg></svg></span>';
  let html = value.replace(/\n/g, "<br>").replace(/\{clock\}\s*/g, clock);
  if (statKey === "ubicacion") {
    html = html.replace(
      /(<br\s*\/?>)(?!\s*<span class="stat-inline-icon")(\s*)(?=[^<]*(?:\d+\s*[–\-:]\s*\d+|de\s+\d+\s+a\s+\d+)[^<]*h)/gi,
      `$1$2${clock}`
    );
  }
  return html;
}

const cases: Array<[string, string | undefined, boolean]> = [
  [
    "Aguascalientes, México<br>Vie–Sáb: 9–18:30 h · Dom: 9–14 h",
    "ubicacion",
    true,
  ],
  [
    "IUVARE, P.º de Los Castaños 2551, Zapopan, Jal.<br>Vie–Sáb 9–18 h · Dom 9–14 h",
    "ubicacion",
    true,
  ],
  ["Medellín, Colombia<br>Sábado y Domingo de 9 a 18 h", "ubicacion", true],
  ["Astrid Training Center<br>9 de Julio 424, Córdoba", "ubicacion", false],
  [
    "Mariano Moreno<br>Rodríguez Peña 233, Córdoba<br>Lun–Mar 9–18 h · Mié 9–14 h",
    "ubicacion",
    true,
  ],
  [
    "Viernes 15:00 a 20:30 hrs.<br>Sábado 9:00 a 18:30 hrs.",
    "horario",
    false,
  ],
];

for (const [input, key, wantClock] of cases) {
  const out = transform(input, key);
  const has = out.includes(CLOCK);
  if (has !== wantClock) {
    throw new Error(`clock=${has} want=${wantClock} key=${key} for ${input}`);
  }
  if ((out.match(/stat-inline-icon/g) || []).length > 1) {
    throw new Error(`double clock for ${input}`);
  }
}

console.log("StatValue.clock.check.ts OK");
