"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HERO_WORDS, MARQUEE_ITEMS } from "@/lib/navigation";

/** ponytail: marquee partners oculto; reactivar cuando haya logos reales. */
const SHOW_HOME_MARQUEE = false;

export function HomeHero() {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = HERO_WORDS[wordIndex];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          const next = current.slice(0, displayText.length + 1);
          setDisplayText(next);
          if (next === current) {
            setTimeout(() => setIsDeleting(true), 1800);
          }
        } else {
          const next = current.slice(0, displayText.length - 1);
          setDisplayText(next);
          if (next === "") {
            setIsDeleting(false);
            setWordIndex((i) => (i + 1) % HERO_WORDS.length);
          }
        }
      },
      isDeleting ? 40 : 80
    );
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, wordIndex]);

  return (
    <section className="hero-section" aria-label="Inicio ESITEF">
      <div className="hero-bg" aria-hidden="true" />

      <div className="hero-body">
        <div className="hero-inner">
          <article className="hero-left">
            <h1 className="titulo-esitef">
              <span className="texto-estatico">
                Sé el profesional
                <br />
                que{" "}
              </span>
              <span className="texto-animado">{displayText}</span>
              <span className="cursor">|</span>
            </h1>
            <p className="hero-subtitle">
              Te ayudamos a crecer en tu profesión a través de herramientas
              útiles, prácticas y actualizadas.
            </p>
          </article>

          <nav className="hero-paises" aria-label="Países y recursos">
            <div className="paises-row">
              <Link className="country-btn" href="/espana">
                España
              </Link>
              <Link className="country-btn" href="/peru">
                Perú
              </Link>
            </div>
            <div className="paises-row">
              <Link className="country-btn" href="/argentina">
                Argentina
              </Link>
              <Link className="country-btn" href="/mexico">
                México
              </Link>
            </div>
            <div className="paises-row">
              <Link className="country-btn" href="/colombia">
                Colombia
              </Link>
              <Link className="country-btn" href="/uruguay">
                Uruguay
              </Link>
            </div>
            <div className="paises-row paises-row--accent">
              <Link className="country-btn btn-online" href="/formaciones">
                Online
              </Link>
              <Link className="country-btn btn-online" href="/libros">
                Libros
              </Link>
              <Link className="country-btn btn-online" href="/articulos">
                Artículos
              </Link>
            </div>
          </nav>
        </div>
      </div>

      {SHOW_HOME_MARQUEE ? (
        <section
          className="marquee-section"
          aria-label="Nuestros partners y menciones"
        >
          <div className="marquee-inner">
            {[0, 1].map((group) =>
              MARQUEE_ITEMS.map((label) => (
                <div
                  key={`${group}-${label}`}
                  className="marquee-item"
                  aria-hidden={group > 0 ? true : undefined}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                  </svg>
                  {label}
                </div>
              ))
            )}
          </div>
        </section>
      ) : null}
    </section>
  );
}
