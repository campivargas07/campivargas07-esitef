import { notFound, permanentRedirect } from "next/navigation";
import { DescargaLibroForm } from "@/components/DescargaLibroForm";
import { PaisPageContent } from "@/components/presencial/PaisPageContent";
import { PresencialPageContent } from "@/components/presencial/PresencialPageContent";
import { getPublishedCourses } from "@/lib/lms";
import { getLibroByFormSlug, LIBRO_FORM_SLUGS } from "@/lib/libros";
import {
  getPaisBySlug,
  getPresencialBySlug,
  getPresencialRedirect,
  PAIS_SLUGS,
  PRESENCIAL_SLUGS,
  resolvePresencialSlug,
} from "@/lib/presenciales";
import redirectsData from "@/data/presencial-redirects.json";
import "@/styles/pais.css";

export const dynamicParams = false;

export function generateStaticParams() {
  const legacy = Object.keys(redirectsData as Record<string, string>);
  const slugs = new Set([
    ...PAIS_SLUGS,
    ...PRESENCIAL_SLUGS,
    ...LIBRO_FORM_SLUGS,
    ...legacy,
  ]);
  return [...slugs].map((slug) => ({ slug }));
}

export default async function PresencialOrPaisPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const redirect = getPresencialRedirect(slug);
  if (redirect) {
    permanentRedirect(`/${redirect}`);
  }

  const pais = getPaisBySlug(slug);
  if (pais) {
    const courses = await getPublishedCourses();
    const related = courses.slice(0, 6).map((c) => ({
        slug: c.slug,
        title: c.title,
        thumbnailUrl: c.thumbnailUrl,
      }));

    return (
      <main className="site-wrapper pais-page">
        <PaisPageContent pais={pais} relatedCourses={related} />
      </main>
    );
  }

  const resolvedSlug = resolvePresencialSlug(slug);
  const formacion = getPresencialBySlug(resolvedSlug);
  if (formacion) {
    return (
      <main className="site-wrapper presencial-page">
        <PresencialPageContent formacion={formacion} />
      </main>
    );
  }

  const libro = getLibroByFormSlug(slug);
  if (libro) {
    return (
      <main className="site-wrapper">
        <DescargaLibroForm libro={libro} />
      </main>
    );
  }

  notFound();
}
