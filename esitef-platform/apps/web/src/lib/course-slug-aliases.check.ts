/**
 * ponytail: self-check slug aliases (masterclass + hub marketing → WP).
 * Run: npx tsx src/lib/course-slug-aliases.check.ts
 */
import {
  COURSE_SLUG_ALIASES,
  priceCatalogSlug,
  resolveCourseSlug,
} from "./course-slug-aliases";

if (resolveCourseSlug("masterclass-conciencia-corporal") !== "masterclass2") {
  throw new Error("conciencia alias → masterclass2");
}
if (priceCatalogSlug("masterclass2") !== "masterclass-conciencia-corporal") {
  throw new Error("price catalog reverse alias");
}

if (
  resolveCourseSlug("club-actualizacion-semestral") !==
  "club-de-actualizacion-semestral"
) {
  throw new Error("club semestral alias");
}
if (resolveCourseSlug("comunicat") !== "foce") {
  throw new Error("comunicat → foce");
}
if (
  resolveCourseSlug("cfm-hombro") !== "capacidad-funcional-de-movimiento-hombro"
) {
  throw new Error("cfm-hombro alias");
}
if (resolveCourseSlug("taller-online-f") !== "taller-onlie-f") {
  throw new Error("taller-online-f → taller-onlie-f (WP typo)");
}
if (priceCatalogSlug("taller-onlie-f") !== "taller-online-f") {
  throw new Error("taller-onlie-f price catalog → taller-online-f");
}
if (priceCatalogSlug("foce") !== "comunicat") {
  throw new Error("foce price catalog → comunicat");
}
if (Object.keys(COURSE_SLUG_ALIASES).length < 11) {
  throw new Error("expected masterclass + hub aliases");
}

console.log("course-slug-aliases.check.ts OK");
