/**
 * Marketing slugs (hubs, precios) → slugs reales en Tutor/WP (ETL).
 * ponytail: mapa estático; ampliar al exportar formaciones si hace falta.
 */
export const COURSE_SLUG_ALIASES: Record<string, string> = {
  "masterclass-gestion-fuerzas": "masterclass1_",
  "masterclass-conciencia-corporal": "masterclass2",
  "masterclass-estabilidad-core": "masterclass3",
  "masterclass-movimiento-eficiente": "masterclass4",
  "masterclass-estabilidad-estatica-dinamica":
    "masterclass-estabilidad-estatica-y-dinamica-matias-sampietro",
};

export function resolveCourseSlug(slug: string): string {
  return COURSE_SLUG_ALIASES[slug] ?? slug;
}

/** Precios en JSON usan slugs de marketing; DB usa slugs WP. */
export function priceCatalogSlug(slug: string): string {
  if (slug in COURSE_SLUG_ALIASES) return slug;
  const marketing = Object.entries(COURSE_SLUG_ALIASES).find(
    ([, canonical]) => canonical === slug
  )?.[0];
  return marketing ?? slug;
}
