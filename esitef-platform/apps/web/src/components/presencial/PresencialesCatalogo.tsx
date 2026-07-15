"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import type {
  PresencialCatalogLink,
  PresencialCatalogo,
  PresencialCatalogoCategory,
  PresencialCatalogoCourse,
} from "@/lib/presenciales";
import "@/styles/presenciales-catalogo.css";

const BODY_CLASS = "esitef-pres-cat-page";

type Props = {
  catalog: PresencialCatalogo;
  linksByKey: Record<string, PresencialCatalogLink[]>;
};

function cityLabel(link: PresencialCatalogLink): string {
  if (link.sede) {
    return link.sede.charAt(0).toUpperCase() + link.sede.slice(1).replace(/-/g, " ");
  }
  return link.paisTitle;
}

function CityPills({ links }: { links: PresencialCatalogLink[] }) {
  if (links.length === 0) return null;

  return (
    <div className="pres-cat-pills" aria-label="Sedes disponibles">
      {links.map((link) => (
        <Link
          key={link.page_slug}
          href={`/${link.page_slug}`}
          className="pres-cat-pill"
        >
          {cityLabel(link)}
        </Link>
      ))}
    </div>
  );
}

function SideCard({
  title,
  modality,
  description,
  image,
  links,
  className,
  titleId,
}: {
  title: string;
  modality: string;
  description?: string;
  image?: string;
  links: PresencialCatalogLink[];
  className?: string;
  titleId?: string;
}) {
  return (
    <article className={`pres-cat-card${className ? ` ${className}` : ""}`}>
      {image ? (
        <div className="pres-cat-card__media">
          <Image src={image} alt="" width={320} height={240} unoptimized />
        </div>
      ) : null}
      <div className="pres-cat-card__body">
        <h3 id={titleId} className="pres-cat-card__title">
          {title}
        </h3>
        {description ? (
          <p className="pres-cat-card__desc">{description}</p>
        ) : null}
        <p className="pres-cat-card__modality">{modality}</p>
        <CityPills links={links} />
      </div>
    </article>
  );
}

function CategoryBlock({
  category,
  linksByKey,
}: {
  category: PresencialCatalogoCategory;
  linksByKey: Record<string, PresencialCatalogLink[]>;
}) {
  const id = category.id.toLowerCase();

  /* A — Movement Coaching: header + una card por módulo */
  if (category.id === "A") {
    return (
      <>
        <div className="pres-cat-group-label pres-cat-group-label--a">
          <h2>{category.title}</h2>
        </div>
        {category.courses.map((course) => (
          <SideCard
            key={course.id}
            className={`pres-cat-card--a-item pres-cat-card--${course.id.toLowerCase()}`}
            title={course.title}
            description={course.description}
            modality={course.modality}
            image={category.image}
            links={
              course.catalog_key ? linksByKey[course.catalog_key] ?? [] : []
            }
          />
        ))}
      </>
    );
  }

  /* G — Postgrado con módulos */
  if (category.id === "G") {
    const course = category.courses[0];
    if (!course) return null;

    return (
      <article className="pres-cat-card pres-cat-card--g">
        {category.image ? (
          <div className="pres-cat-card__media">
            <Image
              src={category.image}
              alt=""
              width={320}
              height={240}
              unoptimized
            />
          </div>
        ) : null}
        <div className="pres-cat-card__body">
          <h2 id={`pres-cat-${id}`} className="pres-cat-card__title">
            {course.title}
          </h2>
          <p className="pres-cat-card__modality">{course.modality}</p>
          {course.modules && course.modules.length > 0 ? (
            <ul className="pres-cat-modules">
              {course.modules.map((mod) => (
                <li key={mod.id}>{mod.title}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </article>
    );
  }

  /* B–F — card simple */
  const course = category.courses[0];
  if (!course) return null;

  return (
    <SideCard
      className={`pres-cat-card--${id}`}
      titleId={`pres-cat-${id}`}
      title={course.title}
      modality={course.modality}
      image={category.image}
      links={course.catalog_key ? linksByKey[course.catalog_key] ?? [] : []}
    />
  );
}

export function PresencialesCatalogo({ catalog, linksByKey }: Props) {
  useEffect(() => {
    document.body.classList.add(BODY_CLASS);
    return () => document.body.classList.remove(BODY_CLASS);
  }, []);

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
          {catalog.categories.map((category) => (
            <CategoryBlock
              key={category.id}
              category={category}
              linksByKey={linksByKey}
            />
          ))}

          <article
            className="pres-cat-card pres-cat-card--docentes"
            aria-labelledby="pres-cat-docentes-title"
          >
            <div className="pres-cat-card__body">
              <h2
                id="pres-cat-docentes-title"
                className="pres-cat-card__title pres-cat-card__title--light"
              >
                Docentes
              </h2>
              <ul className="pres-cat-docentes">
                {catalog.docentes.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
