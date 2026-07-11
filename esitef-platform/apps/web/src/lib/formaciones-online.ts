import hubsData from "@/data/formaciones-hubs.json";
import indexData from "@/data/formaciones-index.json";

export type FormacionIndexCard = {
  title: string;
  alt: string;
  img: string;
  href: string;
  external: boolean;
};

export type HubItem = {
  title: string;
  img?: string;
  href: string;
  price?: string;
  excerpt?: string;
  badge?: string;
  duration?: string;
  course_slug?: string;
};

export type HubFaq = { q: string; a: string };

export type FormacionHub = {
  slug: string;
  title: string;
  subtitle?: string;
  layout: "grid" | "landing";
  theme?: string;
  grid_style?: string;
  grid_header?: string;
  grid_cols?: number;
  show_meta?: boolean;
  show_excerpt?: boolean;
  header_title?: string;
  header_subtitle?: string;
  header_intro?: string;
  intro?: string;
  items?: HubItem[];
  faqs?: HubFaq[];
  faq_columns?: number;
  hero?: Record<string, unknown>;
  content_grid?: Record<string, unknown>;
  planning?: Array<{ month: string; items: string[] }>;
  planning_title?: string;
  planning_description?: string;
  planning_style?: string;
  curriculum?: Record<string, Array<{ title: string; duration: string }>>;
  pricing?: Record<string, unknown>;
  cta?: { label?: string; href?: string; course_slug?: string };
  landing_order?: string[];
  sticky_cta?: boolean;
};

const hubs = hubsData as Record<string, FormacionHub>;
const index = indexData as FormacionIndexCard[];

export const FORMATION_HUB_SLUGS = Object.keys(hubs);

export function getFormacionesIndex(): FormacionIndexCard[] {
  return index;
}

export function getFormacionHub(slug: string): FormacionHub | null {
  return hubs[slug] ?? null;
}

export function gridRemainderClass(count: number, cols = 3): string {
  const r = count % cols;
  if (r === 1) return `formaciones-grid--remainder-1`;
  if (r === 2) return `formaciones-grid--remainder-2`;
  return "";
}
