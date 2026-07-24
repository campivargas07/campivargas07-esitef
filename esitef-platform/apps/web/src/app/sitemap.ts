import type { MetadataRoute } from "next";
import { getPublishedCourses } from "@/lib/lms";
import { PRESENCIAL_SLUGS } from "@/lib/presenciales";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.AUTH_URL ??
  "https://app.esitef.com";

const STATIC_ROUTES = [
  "",
  "/formaciones",
  "/formaciones-presenciales",
  "/contacto",
  "/preguntas-frecuentes",
  "/la-escuela",
  "/blog",
  "/articulos",
  "/libros",
  "/mentorias",
  "/sesiones-online",
  "/talleres-privados-clinicas",
  "/privacidad",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl.replace(/\/$/, "");
  const now = new Date();
  const staticEntries = STATIC_ROUTES.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const courses = await getPublishedCourses();
  const courseEntries = courses.map((course) => ({
    url: `${base}/cursos/${course.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const presencialEntries = PRESENCIAL_SLUGS.map((slug) => ({
    url: `${base}/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...courseEntries, ...presencialEntries];
}
