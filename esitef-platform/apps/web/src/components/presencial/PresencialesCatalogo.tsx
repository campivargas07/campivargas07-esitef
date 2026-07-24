"use client";

import Image from "next/image";
import { useEffect, type CSSProperties } from "react";
import type {
  PresencialCatalogLink,
  PresencialCatalogo,
  PresencialCatalogoCategory,
  PresencialCatalogoCourse,
} from "@/lib/presenciales";
import "@/styles/presenciales-catalogo.css";

const BODY_CLASS = "esitef-pres-cat-page";

const VISUAL_TILES = [
  {
    id: "v1",
    src: "/img/nuestras-formaciones-1.webp",
    className: "pres-cat-vis--1",
  },
  {
    id: "v2",
    src: "/img/crecer-en-movimiento.webp",
    className: "pres-cat-vis--2",
  },
  {
    id: "v3",
    src: "/img/Biomecanica-del-Movimiento.webp",
    className: "pres-cat-vis--3",
  },
] as const;

const DOCENTE_COUNTRIES: Record<string, { iso: string; label: string }> = {
  "Tomás Bonino Covas": { iso: "es", label: "España" },
  "Matías Sampietro": { iso: "ar", label: "Argentina" },
  "Noelia Martínez": { iso: "ar", label: "Argentina" },
  "Javier Asinari": { iso: "ar", label: "Argentina" },
  "Javier Guerra Armas": { iso: "es", label: "España" },
  "Javier Crupnick": { iso: "ar", label: "Argentina" },
  "Rocío Flamini": { iso: "ar", label: "Argentina" },
  "Cristian Gays": { iso: "ar", label: "Argentina" },
  "Andrés Thomas": { iso: "ar", label: "Argentina" },
  "Luis García": { iso: "ar", label: "Argentina" },
  "Guillermo Cuevas": { iso: "mx", label: "México" },
};

type Props = {
  catalog: PresencialCatalogo;
  linksByKey: Record<string, PresencialCatalogLink[]>;
};

function byId(
  categories: PresencialCatalogoCategory[],
  id: string
): PresencialCatalogoCategory | undefined {
  return categories.find((c) => c.id === id);
}

function firstCourse(
  cat?: PresencialCatalogoCategory
): PresencialCatalogoCourse | undefined {
  return cat?.courses[0];
}

/* 1. Movement Coaching */
function MovementCoachingCard({
  category,
}: {
  category: PresencialCatalogoCategory;
}) {
  return (
    <article className="pres-cat-card pres-cat-card--mc">
      <div className="pres-cat-card__text">
        <h2 className="pres-cat-card__heading">{category.title}</h2>
        <div className="pres-cat-mc-list">
          {category.courses.map((course) => (
            <div key={course.id} className="pres-cat-mc-item">
              <h3 className="pres-cat-mc-item__title">{course.title}</h3>
              {course.description ? (
                <p className="pres-cat-mc-item__desc">{course.description}</p>
              ) : null}
              <p className="pres-cat-mc-item__modality">{course.modality}</p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

/* 2. Otros cursos (B–F agrupados) */
function OtrosCursosCard({
  categories,
}: {
  categories: PresencialCatalogoCategory[];
}) {
  return (
    <article className="pres-cat-card pres-cat-card--otros">
      <div className="pres-cat-card__text">
        {categories.map((cat) => {
          const c = firstCourse(cat);
          if (!c) return null;
          return (
            <div key={cat.id} className="pres-cat-otros-item">
              <h3 className="pres-cat-otros-item__title">{c.title}</h3>
              {c.description ? (
                <p className="pres-cat-otros-item__desc">{c.description}</p>
              ) : null}
              <p className="pres-cat-otros-item__modality">{c.modality}</p>
            </div>
          );
        })}
      </div>
    </article>
  );
}

/* 3. Postgrado */
function PostgradoCard({ category }: { category: PresencialCatalogoCategory }) {
  const course = firstCourse(category);
  if (!course) return null;

  return (
    <article className="pres-cat-card pres-cat-card--postgrado">
      <div className="pres-cat-card__text">
        <h2 className="pres-cat-card__heading">{course.title}</h2>
        <p className="pres-cat-card__modality">{course.modality}</p>
        {course.modules && course.modules.length > 0 ? (
          <ol className="pres-cat-modules">
            {course.modules.map((mod, i) => (
              <li key={mod.id}>
                <span className="pres-cat-modules__num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{mod.title}</span>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </article>
  );
}

/* 4. Docentes */
function DocentesCard({ names }: { names: string[] }) {
  return (
    <section
      className="pres-cat-card pres-cat-card--docentes"
      aria-labelledby="pres-cat-docentes-title"
    >
      <div className="pres-cat-docentes__inner">
        <p className="pres-cat-docentes__watermark" aria-hidden>
          Equipo
        </p>
        <div className="pres-cat-docentes__header">
          <h2 id="pres-cat-docentes-title" className="pres-cat-card__heading">
            Docentes
          </h2>
          <p className="pres-cat-docentes__count">
            {String(names.length).padStart(2, "0")} profesionales
          </p>
        </div>
        <ul className="pres-cat-docentes">
          {names.map((name, i) => {
            const country = DOCENTE_COUNTRIES[name];
            return (
              <li key={name} style={{ "--i": i } as CSSProperties}>
                {country ? (
                  <img
                    className="pres-cat-docentes__flag"
                    src={`https://cdn.jsdelivr.net/gh/HatScripts/circle-flags@2.7.0/flags/${country.iso}.svg`}
                    alt=""
                    width={30}
                    height={30}
                    title={country.label}
                    decoding="async"
                  />
                ) : null}
              <span className="pres-cat-docentes__name">{name}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* Visual tile — image only */
function VisualTile({ src, className }: { src: string; className: string }) {
  return (
    <article
      className={`pres-cat-card pres-cat-card--visual ${className}`}
      aria-hidden
    >
      <div className="pres-cat-card__media">
        <Image src={src} alt="" width={800} height={600} unoptimized />
      </div>
    </article>
  );
}

export function PresencialesCatalogo({ catalog }: Props) {
  useEffect(() => {
    document.body.classList.add(BODY_CLASS);
    return () => document.body.classList.remove(BODY_CLASS);
  }, []);

  const A = byId(catalog.categories, "A");
  const B = byId(catalog.categories, "B");
  const C = byId(catalog.categories, "C");
  const D = byId(catalog.categories, "D");
  const E = byId(catalog.categories, "E");
  const F = byId(catalog.categories, "F");
  const G = byId(catalog.categories, "G");

  const otrosCategories = [B, C, D, E, F].filter(
    Boolean
  ) as PresencialCatalogoCategory[];

  return (
    <div className="pres-cat-page">
      <header className="pres-cat-hero">
        <div className="pres-cat-hero__inner">
          <h1 className="pres-cat-hero__title">{catalog.title}</h1>
          <p className="pres-cat-hero__subtitle">{catalog.subtitle}</p>
        </div>
      </header>

      <div className="pres-cat-mosaic-wrap">
        <div className="pres-cat-mosaic">
          {A ? <MovementCoachingCard category={A} /> : null}
          <VisualTile
            src={VISUAL_TILES[0].src}
            className={VISUAL_TILES[0].className}
          />
          <VisualTile
            src={VISUAL_TILES[1].src}
            className={VISUAL_TILES[1].className}
          />
          <OtrosCursosCard categories={otrosCategories} />
          {G ? <PostgradoCard category={G} /> : null}
          <VisualTile
            src={VISUAL_TILES[2].src}
            className={VISUAL_TILES[2].className}
          />
          <DocentesCard names={catalog.docentes} />
        </div>
      </div>
    </div>
  );
}
