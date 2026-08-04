/**
 * ponytail: assert-based self-check for presencial preview slugs.
 * Run: npx tsx src/lib/presenciales-preview.check.ts
 */
import {
  getPresencialBySlug,
  getPublicPresencialSlugs,
  isPresencialListedPublic,
  isPresencialPreview,
  isPresencialPreviewPublished,
} from "./presenciales";

const LIVE = "autonomia-motriz-adultos-mayores-cordoba";
const PREVIEW = "autonomia-motriz-adultos-mayores-cordoba-v2";

const live = getPresencialBySlug(LIVE);
const preview = getPresencialBySlug(PREVIEW);
const publicSlugs = getPublicPresencialSlugs();

if (!live) throw new Error("live entry missing");
if (!preview) throw new Error("preview entry missing");
if (isPresencialPreview(live)) throw new Error("live must not be preview");
if (!isPresencialPreview(preview)) throw new Error("v2 must be preview");
if (preview.preview_of !== LIVE) throw new Error("preview_of must point to live");
if (!isPresencialListedPublic(live)) throw new Error("live must be public");
if (isPresencialListedPublic(preview)) throw new Error("v2 must not be public");
if (publicSlugs.includes(PREVIEW)) throw new Error("v2 must not be in public slugs");
if (!publicSlugs.includes(LIVE)) throw new Error("live must stay in public slugs");
if (!preview.syllabus?.pdf_url?.includes("longevidad-en-movimiento.pdf")) {
  throw new Error("v2 pdf_url missing");
}
if (preview.content_layout !== "rich") {
  throw new Error("v2 must use content_layout rich");
}
if ((preview.program ?? []).length !== (live.program ?? []).length) {
  throw new Error("v2 short program must match live accordion");
}
if (preview.mission !== live.mission) {
  throw new Error("v2 mission must match live");
}
const axes = (preview.program_extended ?? []).filter((m) =>
  /^\d+\./.test(m.title)
);
if (axes.length !== 5) {
  throw new Error(`v2 expected 5 numbered axes in program_extended, got ${axes.length}`);
}
const hasPanorama = (preview.program_extended ?? []).some((m) =>
  m.title.toLowerCase().startsWith("panorama")
);
if (!hasPanorama) throw new Error("v2 missing Panorama general in program_extended");

// Reachable by direct URL for approval; never listed in catalog/sitemap.
if (!isPresencialPreviewPublished()) {
  throw new Error("preview must be reachable (isPresencialPreviewPublished)");
}

console.log("presenciales-preview.check.ts OK");
