/**
 * ponytail: assert-based self-check for presenciales catalog links.
 * Run: npx tsx src/lib/presenciales-catalogo.check.ts
 */
import {
  getPresencialesByCatalogKey,
  getPresencialesCatalogLinksByKey,
  getPresencialesCatalogo,
} from "./presenciales";

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

console.log("presenciales-catalogo.check.ts OK");
