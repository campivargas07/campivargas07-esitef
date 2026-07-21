/**
 * ponytail: assert-based self-check for presenciales catalog links.
 * Run: npx tsx src/lib/presenciales-catalogo.check.ts
 */
import {
  getPaisBySlug,
  getPresencialBySlug,
  getPresencialesByCatalogKey,
  getPresencialesCatalogLinksByKey,
  getPresencialesCatalogo,
  PAIS_SLUGS,
  PRESENCIAL_COVER_OVERRIDES,
  resolvePresencialCoverImage,
} from "./presenciales";
import presencialesData from "@/data/presenciales.json";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const catalog = getPresencialesCatalogo();
assert(catalog.categories.length === 7, "7 categories A–G");
assert(catalog.docentes.length === 11, "11 docentes");

const dolorLinks = getPresencialesByCatalogKey("dolor-movimiento");
assert(dolorLinks.length >= 4, "dolor-movimiento has multiple sedes");
assert(
  dolorLinks.every((l) => l.page_slug && l.flagIso),
  "each link has page_slug and flagIso"
);

const byKey = getPresencialesCatalogLinksByKey();
assert(
  (byKey["evaluacion-dinamica-funcional"]?.length ?? 0) >= 1,
  "evaluacion-dinamica-funcional linked"
);

const evalCover = PRESENCIAL_COVER_OVERRIDES["evaluacion-dinamica-funcional"];
for (const paisSlug of PAIS_SLUGS) {
  const pais = getPaisBySlug(paisSlug);
  assert(pais, `pais ${paisSlug}`);
  for (const sede of pais.sedes) {
    for (const course of sede.courses) {
      const cover = resolvePresencialCoverImage({
        page_slug: course.page_slug,
        title: course.title,
        image: course.image,
      });
      if (cover === evalCover) {
        assert(
          course.image === evalCover,
          `${paisSlug}/${sede.slug}: evaluación dinámica cover`
        );
      }
    }
  }
}

for (const entry of Object.values(presencialesData)) {
  if (entry.catalog_key !== "evaluacion-dinamica-funcional") continue;
  const resolved = getPresencialBySlug(entry.page_slug);
  assert(
    resolved?.hero_image?.url === evalCover,
    `${entry.page_slug}: hero cover`
  );
}

const mcCover = PRESENCIAL_COVER_OVERRIDES["movement-coaching"];
for (const entry of Object.values(presencialesData)) {
  if (entry.catalog_key !== "movement-coaching") continue;
  const resolved = getPresencialBySlug(entry.page_slug);
  assert(
    resolved?.hero_image?.url === mcCover,
    `${entry.page_slug}: movement coaching hero`
  );
}

const gfCover = PRESENCIAL_COVER_OVERRIDES["gestion-fuerzas"];
for (const entry of Object.values(presencialesData)) {
  if (entry.catalog_key !== "gestion-fuerzas") continue;
  const resolved = getPresencialBySlug(entry.page_slug);
  assert(
    resolved?.hero_image?.url === gfCover,
    `${entry.page_slug}: gestion fuerzas hero`
  );
}

const paCover = PRESENCIAL_COVER_OVERRIDES["pedagogia-aprendizaje-motor"];
for (const entry of Object.values(presencialesData)) {
  if (entry.catalog_key !== "pedagogia-aprendizaje-motor") continue;
  const resolved = getPresencialBySlug(entry.page_slug);
  assert(
    resolved?.hero_image?.url === paCover,
    `${entry.page_slug}: pedagogia aplicada hero`
  );
}

console.log("presenciales-catalogo.check.ts OK");
