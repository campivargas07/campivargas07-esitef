import paisesData from "@/data/paises.json";
import presencialesData from "@/data/presenciales.json";
import redirectsData from "@/data/presencial-redirects.json";

export type PaisCourse = {
  title: string;
  page_slug?: string;
  url?: string;
  type: string;
  image?: string;
  dates?: string;
  professor?: string;
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

const paises = paisesData as Record<string, Pais>;
const presenciales = presencialesData as Record<string, PresencialFormacion>;
const redirects = redirectsData as Record<string, string>;

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
