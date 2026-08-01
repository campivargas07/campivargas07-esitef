import type { MetadataRoute } from "next";
import { getAllBlogSlugs } from "@/lib/blog";
import { getPublishedCourses } from "@/lib/lms";
import { getPublicPresencialSlugs } from "@/lib/presenciales";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.AUTH_URL ??
  "https://esitef.com";

const STATIC_ROUTES = [
  "",
  "/formaciones",
  "/formaciones-presenciales",
  "/calendario-presenciales",
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

  const presencialEntries = getPublicPresencialSlugs().map((slug) => ({
    url: `${base}/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const blogEntries = getAllBlogSlugs().map((slug) => ({
    url: `${base}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...courseEntries, ...presencialEntries, ...blogEntries];
}
