import Image from "next/image";
import Link from "next/link";
import {
  getFormacionesIndex,
  gridRemainderClass,
} from "@/lib/formaciones-online";

export function FormacionesIndexGrid() {
  const cards = getFormacionesIndex();
  const gridClass = `formaciones-grid ${gridRemainderClass(cards.length)}`.trim();
  const remainder = cards.length % 3;

  return (
    <section
      className="formaciones-section esitef-formaciones-page"
      aria-label="Nuestras Formaciones Online"
    >
      <div className="formaciones-inner">
        <h1 className="formaciones-titulo">Formaciones Online</h1>
        <p className="formaciones-desc">
          Explora nuestras experiencias formativas desde dónde y cuando quieras.
        </p>

        <div className="formaciones-container">
          <div className={gridClass}>
            {cards.map((card, index) => {
              const isSolo = remainder === 1 && index === cards.length - 1;
              const className = `curso-card${isSolo ? " curso-card--solo" : ""}`;
              const inner = (
                <>
                  <div className="curso-image">
                    <Image
                      src={card.img}
                      alt={card.alt}
                      width={600}
                      height={450}
                      unoptimized
                    />
                  </div>
                  <div className="curso-content">
                    <div className="curso-header">
                      <h3>{card.title}</h3>
                      <span className="curso-ver-mas">Ver más</span>
                    </div>
                  </div>
                </>
              );

              return card.external ? (
                <a
                  key={card.href}
                  href={card.href}
                  className={className}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {inner}
                </a>
              ) : (
                <Link key={card.href} href={card.href} className={className}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
