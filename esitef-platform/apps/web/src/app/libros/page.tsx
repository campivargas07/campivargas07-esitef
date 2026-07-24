import Link from "next/link";
import { getLibros } from "@/lib/libros";
import "@/styles/libros.css";

export default function LibrosPage() {
  const libros = getLibros();

  return (
    <section className="libros-section" aria-label="Descarga nuestros libros">
      <div className="libros-inner">
        <h1 className="libros-titulo">Descarga nuestros libros</h1>
        <div className="libros-grid">
          {libros.map((book) => (
            <article key={book.key} className="libro-card">
              <div className="libro-image">
                <img src={book.image} alt={book.title} loading="lazy" />
              </div>
              <div className="libro-content">
                <h2 className="libro-title">{book.title}</h2>
                <Link className="libro-btn" href={book.form_path}>
                  Descargar
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
