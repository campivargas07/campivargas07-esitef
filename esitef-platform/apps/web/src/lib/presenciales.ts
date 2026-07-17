import paisesData from "@/data/paises.json";
import presencialesData from "@/data/presenciales.json";
import presencialesCatalogoData from "@/data/presenciales-catalogo.json";
import redirectsData from "@/data/presencial-redirects.json";

export type PaisCourse = {
  title: string;
  page_slug?: string;
  url?: string;
  type: string;
  image?: string;
  dates?: string;
  professor?: string;
  cupo_lleno?: boolean;
};

export type PaisSede = {
  slug: string;
  name: string;
  courses: PaisCourse[];
};

export type Pais = {
  title: string;
  tagline: string;
  sedes: PaisSede[];
};

export type PresencialHeroMeta = {
  icon: string;
  /** Optional top line under the icon (e.g. "Parte Online"). */
  label?: string;
  value: string;
};

export type PresencialStat = {
  key: string;
  label: string;
  value: string;
};

export type PresencialProfessor = {
  name: string;
  role?: string;
  image?: string;
  bio?: string[];
};

export type PresencialProgramModule = {
  title: string;
  items: string[];
};

export type PresencialInscription = {
  investment?: string;
  deposit?: string;
  concept?: string;
  holder?: string;
  accounts?: { label: string; number: string }[];
  discounts?: string[];
  whatsapp_url?: string;
  email_url?: string;
  contact_email?: string;
  whatsapp_text?: string;
  email_body?: string;
};

export type PresencialFormacion = {
  page_slug: string;
  page_title?: string;
  catalog_key?: string;
  pais?: string;
  sede?: string;
  subtitle?: string;
  title: string;
  title_bold?: string;
  hero_meta?: PresencialHeroMeta[];
  hero_image?: { url: string; alt: string };
  mission?: string;
  stats?: PresencialStat[];
  stats_media?: { url: string; alt: string };
  syllabus?: { title?: string; description?: string; pdf_url?: string };
  program?: PresencialProgramModule[];
  professors_resolved?: PresencialProfessor[];
  inscription?: PresencialInscription;
};

export type PresencialCatalogoModule = {
  id: string;
  title: string;
};

export type PresencialCatalogoCourse = {
  id: string;
  title: string;
  description?: string;
  modality: string;
  catalog_key?: string;
  modules?: PresencialCatalogoModule[];
};

export type PresencialCatalogoCategory = {
  id: string;
  title: string;
  image?: string;
  courses: PresencialCatalogoCourse[];
};

export type PresencialCatalogo = {
  title: string;
  subtitle: string;
  categories: PresencialCatalogoCategory[];
  docentes: string[];
};

export type PresencialCatalogLink = {
  pais: string;
  paisTitle: string;
  page_slug: string;
  sede?: string;
  flagIso: string;
};

const paises = paisesData as Record<string, Pais>;
const presenciales = presencialesData as Record<string, PresencialFormacion>;
const presencialesCatalogo = presencialesCatalogoData as PresencialCatalogo;
const redirects = redirectsData as Record<string, string>;

const PAIS_FLAG_ISO: Record<string, string> = {
  espana: "es",
  peru: "pe",
  argentina: "ar",
  mexico: "mx",
  colombia: "co",
  uruguay: "uy",
};

const PAIS_TITLES: Record<string, string> = Object.fromEntries(
  Object.entries(paises).map(([slug, pais]) => [slug, pais.title])
);

export const PAIS_SLUGS = Object.keys(paises);
export const PRESENCIAL_SLUGS = Object.keys(presenciales);

export function getPaisBySlug(slug: string): Pais | null {
  return paises[slug] ?? null;
}

export function getPresencialBySlug(slug: string): PresencialFormacion | null {
  return presenciales[slug] ?? null;
}

export function getPresencialRedirect(slug: string): string | null {
  return redirects[slug] ?? null;
}

export function resolvePresencialSlug(slug: string): string {
  return redirects[slug] ?? slug;
}

export function getPaisCourseUrl(course: PaisCourse): string {
  if (course.page_slug) return `/${course.page_slug}`;
  if (course.url) return course.url;
  return "#";
}

export function isExternalCourseUrl(course: PaisCourse): boolean {
  return Boolean(course.url && !course.page_slug);
}

export function courseCardLayout(
  count: number
): "single" | "duo" | "quad" | "multi" {
  if (count === 1) return "single";
  if (count === 2) return "duo";
  if (count === 4) return "quad";
  return "multi";
}

export function getPresencialesCatalogo(): PresencialCatalogo {
  return presencialesCatalogo;
}

/** Links to presencial pages matching a catalog_key (one per sede/page). */
export function getPresencialesByCatalogKey(
  catalogKey: string
): PresencialCatalogLink[] {
  return Object.values(presenciales)
    .filter((entry) => entry.catalog_key === catalogKey && entry.pais)
    .map((entry) => ({
      pais: entry.pais!,
      paisTitle: PAIS_TITLES[entry.pais!] ?? entry.pais!,
      page_slug: entry.page_slug,
      sede: entry.sede,
      flagIso: PAIS_FLAG_ISO[entry.pais!] ?? entry.pais!,
    }))
    .sort((a, b) => a.paisTitle.localeCompare(b.paisTitle, "es"));
}

export function getPresencialesCatalogLinksByKey(): Record<
  string,
  PresencialCatalogLink[]
> {
  const links: Record<string, PresencialCatalogLink[]> = {};
  for (const entry of Object.values(presenciales)) {
    if (!entry.catalog_key || !entry.pais) continue;
    const key = entry.catalog_key;
    if (!links[key]) links[key] = [];
    links[key].push({
      pais: entry.pais,
      paisTitle: PAIS_TITLES[entry.pais] ?? entry.pais,
      page_slug: entry.page_slug,
      sede: entry.sede,
      flagIso: PAIS_FLAG_ISO[entry.pais] ?? entry.pais,
    });
  }
  for (const key of Object.keys(links)) {
    links[key].sort((a, b) => a.paisTitle.localeCompare(b.paisTitle, "es"));
  }
  return links;
}
