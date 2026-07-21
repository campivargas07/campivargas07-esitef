import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { DescargaLibroForm } from "@/components/DescargaLibroForm";
import { DescargaLibroScreenEffect } from "@/components/DescargaLibroScreenEffect";
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

function plainText(html: string | undefined, max = 160): string | undefined {
  if (!html) return undefined;
  const text = html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return undefined;
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSlug = resolvePresencialSlug(slug);

  const formacion = getPresencialBySlug(resolvedSlug);
  if (formacion) {
    const title =
      formacion.page_title ||
      [formacion.title, formacion.title_bold].filter(Boolean).join(" — ");
    const description =
      plainText(formacion.mission) ||
      `${title} — Formación presencial ESITEF`;
    const image = formacion.hero_image?.url;
    return {
      title: `${title} | ESITEF`,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        images: image
          ? [{ url: image, alt: formacion.hero_image?.alt || title }]
          : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: image ? [image] : undefined,
      },
    };
  }

  const pais = getPaisBySlug(slug);
  if (pais) {
    const title = `${pais.title} — Formaciones presenciales ESITEF`;
    const description = pais.tagline;
    const image = pais.sedes
      .flatMap((s) => s.courses)
      .find((c) => c.image)?.image;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        images: image ? [{ url: image, alt: title }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: image ? [image] : undefined,
      },
    };
  }

  const libro = getLibroByFormSlug(slug);
  if (libro) {
    const title = libro.title;
    const description = `Descarga gratuita — ${title}`;
    return {
      title: `${title} | ESITEF`,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        images: libro.image
          ? [{ url: libro.image, alt: title }]
          : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: libro.image ? [libro.image] : undefined,
      },
    };
  }

  return { title: "ESITEF" };
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
    const related = courses.slice(0, 4).map((c) => ({
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
      <main className="site-wrapper descarga-libro-page">
        <DescargaLibroScreenEffect />
        <DescargaLibroForm libro={libro} />
      </main>
    );
  }

  notFound();
}
