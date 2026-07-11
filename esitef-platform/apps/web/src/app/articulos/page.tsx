import { getArticulos } from "@/lib/articulos";
import "@/styles/articulos.css";

export default function ArticulosPage() {
  const articulos = getArticulos();

  return (
    <section className="articulos-section" aria-label="Artículos">
      <div className="articulos-inner">
        <h1 className="articulos-titulo">Artículos</h1>
        <div className="articulos-grid">
          {articulos.map((item) => (
            <article key={item.key} className="articulo-card">
              <div className="articulo-image">
                <img src={item.image} alt={item.title} loading="lazy" />
              </div>
              <h2 className="articulo-title">{item.title}</h2>
              {item.pdf_url && (
                <a
                  className="articulo-btn"
                  href={item.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
