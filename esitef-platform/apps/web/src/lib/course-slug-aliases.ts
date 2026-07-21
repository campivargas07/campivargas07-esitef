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

/** Miniaturas fijas (por slug marketing o WP). */
export const COURSE_THUMBNAIL_OVERRIDES: Record<string, string> = {
  "masterclass-gestion-fuerzas": "/img/masterclass-1.webp",
  masterclass1_: "/img/masterclass-1.webp",
  "masterclass-conciencia-corporal": "/img/masterclass-2.webp",
  masterclass2: "/img/masterclass-2.webp",
  "masterclass-estabilidad-core": "/img/masterclass-3.webp",
  masterclass3: "/img/masterclass-3.webp",
  "masterclass-movimiento-eficiente": "/img/masterclass-4.webp",
  masterclass4: "/img/masterclass-4.webp",
  "masterclass-estabilidad-estatica-dinamica": "/img/masterclass-5.webp",
  "masterclass-estabilidad-estatica-y-dinamica-matias-sampietro":
    "/img/masterclass-5.webp",
};

export function resolveCourseSlug(slug: string): string {
  return COURSE_SLUG_ALIASES[slug] ?? slug;
}

export function resolveCourseThumbnail(
  slug: string,
  fallback?: string | null
): string | null {
  return (
    COURSE_THUMBNAIL_OVERRIDES[slug] ??
    COURSE_THUMBNAIL_OVERRIDES[resolveCourseSlug(slug)] ??
    fallback ??
    null
  );
}

/** Precios en JSON usan slugs de marketing; DB usa slugs WP. */
export function priceCatalogSlug(slug: string): string {
  if (slug in COURSE_SLUG_ALIASES) return slug;
  const marketing = Object.entries(COURSE_SLUG_ALIASES).find(
    ([, canonical]) => canonical === slug
  )?.[0];
  return marketing ?? slug;
}
