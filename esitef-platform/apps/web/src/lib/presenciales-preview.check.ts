/**
 * ponytail: assert live Cordoba rich landing (post-v2 cutover).
 * Run: npx tsx src/lib/presenciales-preview.check.ts
 */
import {
  getPresencialBySlug,
  getPresencialRedirect,
  getPublicPresencialSlugs,
  isPresencialListedPublic,
  isPresencialPreview,
} from "./presenciales";

const LIVE = "autonomia-motriz-adultos-mayores-cordoba";
const LEGACY_PREVIEW = "autonomia-motriz-adultos-mayores-cordoba-v2";

const live = getPresencialBySlug(LIVE);
const publicSlugs = getPublicPresencialSlugs();

if (!live) throw new Error("live entry missing");
if (isPresencialPreview(live)) throw new Error("live must not be preview");
if (!isPresencialListedPublic(live)) throw new Error("live must be public");
if (!publicSlugs.includes(LIVE)) throw new Error("live must stay in public slugs");
if (publicSlugs.includes(LEGACY_PREVIEW)) {
  throw new Error("legacy v2 must not be in public slugs");
}
if (getPresencialBySlug(LEGACY_PREVIEW)) {
  throw new Error("legacy v2 entry must be removed (use redirect)");
}
if (getPresencialRedirect(LEGACY_PREVIEW) !== LIVE) {
  throw new Error("legacy v2 must redirect to live");
}
if (live.content_layout !== "rich") {
  throw new Error("live must use content_layout rich");
}
if (!live.syllabus?.pdf_url?.includes("longevidad-en-movimiento.pdf")) {
  throw new Error("live pdf_url missing");
}
const axes = (live.program_extended ?? []).filter((m) => /^\d+\./.test(m.title));
if (axes.length !== 5) {
  throw new Error(`live expected 5 numbered axes in program_extended, got ${axes.length}`);
}
const hasOrigin = (live.program_extended ?? []).some((m) =>
  m.title.toLowerCase().includes("cómo nace")
);
if (!hasOrigin) throw new Error("live missing ¿Cómo nace el Programa?");
const hasActivism = (live.program_extended ?? []).some((m) =>
  m.title.toLowerCase().includes("activismo")
);
if (!hasActivism) throw new Error("live missing Activismo gerontológico");

console.log("presenciales-preview.check.ts OK");
