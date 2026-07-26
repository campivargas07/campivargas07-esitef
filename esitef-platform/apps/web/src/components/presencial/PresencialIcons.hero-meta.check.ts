/**
 * ponytail: assert-based self-check for hero meta desktop split.
 * Run: npx tsx src/components/presencial/PresencialIcons.hero-meta.check.ts
 */
import { splitPresencialHeroMeta } from "./PresencialIcons";

const gdlDate = splitPresencialHeroMeta({
  icon: "calendar",
  value: "Inicio 20, 21 y 22 NOV 2026",
});
if (gdlDate.label !== "Inicio 20, 21 y 22" || gdlDate.value !== "NOV 2026") {
  throw new Error(`date split failed: ${JSON.stringify(gdlDate)}`);
}

const prof = splitPresencialHeroMeta({
  icon: "professor",
  value: "Tomás Bonino",
});
if (prof.label !== "Tomás" || prof.value !== "Bonino") {
  throw new Error(`professor split failed: ${JSON.stringify(prof)}`);
}

const loc = splitPresencialHeroMeta({
  icon: "location",
  value: "Guadalajara (MEX)",
});
if (loc.label !== "Guadalajara" || loc.value !== "(MEX)") {
  throw new Error(`location split failed: ${JSON.stringify(loc)}`);
}

const labeled = splitPresencialHeroMeta({
  icon: "location",
  label: "Córdoba",
  value: "(ARG)",
});
if (labeled.inline !== "Córdoba (ARG)") {
  throw new Error(`labeled inline failed: ${labeled.inline}`);
}

const short = splitPresencialHeroMeta({
  icon: "calendar",
  value: "Inicio 2027",
});
if (short.label) throw new Error("Inicio 2027 must stay single line");

console.log("PresencialIcons.hero-meta.check.ts OK");
