/**
 * ponytail: calendario presencial — fechas autonomía Córdoba + sort.
 * Run: npx tsx src/lib/presencial-calendar.check.ts
 */
import {
  getPresencialCalendarItems,
  pickDatesLabel,
} from "./presencial-calendar";
import presenciales from "@/data/presenciales.json";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const autonomia = (
  presenciales as Record<string, { hero_meta?: { icon?: string; label?: string; value?: string }[] }>
)["autonomia-motriz-adultos-mayores-cordoba"];

assert(autonomia, "autonomia slug missing");
const dates = pickDatesLabel(autonomia);
assert(
  dates.includes("27") && /NOV/i.test(dates),
  `autonomia dates should be 27-29 NOV, got: ${dates}`
);

const items = getPresencialCalendarItems();
assert(items.length >= 10, "expected presencial items");

const gdl = items.filter((i) => i.sede === "guadalajara");
assert(gdl.length >= 2, "guadalajara courses missing");

const evalMadCal = items.find(
  (i) => i.slug === "evaluacion-dinamica-funcional-madrid"
);
assert(evalMadCal, "eval dinamica madrid in calendar");
assert(evalMadCal!.pais === "espana", "eval dinamica madrid pais");
assert(
  /27/.test(evalMadCal!.datesLabel) && /NOV/i.test(evalMadCal!.datesLabel),
  `eval dinamica madrid dates: ${evalMadCal!.datesLabel}`
);

const autoItem = items.find(
  (i) => i.slug === "autonomia-motriz-adultos-mayores-cordoba"
);
assert(autoItem, "autonomia in calendar");
assert(
  autoItem!.sortKey < 20261201,
  "autonomia should sort in Nov 2026, not TBD"
);

const mxFlags = items.filter((i) => i.pais === "mexico");
assert(
  mxFlags.every((i) => i.flagIso === "mx"),
  "mexico must use mx flag"
);

const esFlags = items.filter((i) => i.pais === "espana");
assert(
  esFlags.every((i) => i.flagIso === "es"),
  "espana must use Spain flag (es), not EU"
);

assert(
  !items.some((i) => i.slug === "dolor-y-movimiento-guadalajara"),
  "past gdl dolor must not appear in calendar"
);
assert(
  !items.some((i) => i.slug === "dolor-y-movimiento-toluca"),
  "past toluca dolor must not appear in calendar"
);

const gdlActive = items.find(
  (i) => i.slug === "especializacion-movement-coaching-guadalajara"
);
assert(gdlActive, "active gdl coaching must remain");
assert(
  !/guadalajara/i.test(gdlActive!.title),
  `title should not repeat city, got: ${gdlActive!.title}`
);
assert(gdlActive!.imageUrl.length > 0, "thumb image required");
assert(gdlActive!.sedeLabel === "Guadalajara", "city once in sedeLabel");

console.log("presencial-calendar.check.ts: ok", {
  count: items.length,
  autonomiaDates: dates,
});
