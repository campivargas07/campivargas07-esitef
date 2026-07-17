/**
 * ponytail: self-check slug aliases masterclass.
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
if (Object.keys(COURSE_SLUG_ALIASES).length < 5) {
  throw new Error("expected 5 masterclass aliases");
}

console.log("course-slug-aliases.check.ts OK");
