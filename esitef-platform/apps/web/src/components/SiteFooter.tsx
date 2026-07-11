"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/ingresar") return null;

  return (
    <footer
      className="esitef-footer"
      id="colophon"
      aria-label="Pie de página ESITEF"
    >
      <div className="footer-card">
        <div className="footer-content">
          <div className="footer-top">
            <div className="footer-newsletter">
              <h3>Suscríbete a nuestro newsletter</h3>
              <form
                className="footer-newsletter-form"
                onSubmit={(e) => e.preventDefault()}
                aria-label="Formulario newsletter"
              >
                <input
                  type="email"
                  placeholder="nombre@email.com"
                  aria-label="Tu email"
                />
                <button type="submit">Suscribirse</button>
              </form>
            </div>

            <div className="footer-pages">
              <span className="footer-pages-label">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    d="M4 4l8 8M12 4v8H4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Páginas
              </span>
              <nav className="footer-pages-links" aria-label="Páginas del sitio">
                <Link href="/">Inicio</Link>
                <Link href="/la-escuela">La Escuela</Link>
                <Link href="/formaciones">Formaciones</Link>
                <Link href="/contacto">Contacto</Link>
              </nav>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-bottom-left">
              <div className="footer-social" aria-label="Redes sociales">
                <a
                  href="https://www.instagram.com/esitef_oficial/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <InstagramIcon />
                </a>
                <a
                  href="https://www.linkedin.com/company/esitef/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <LinkedInIcon />
                </a>
              </div>
              <a href="mailto:info@esitef.com" className="footer-email">
                info@esitef.com
              </a>
            </div>
            <p className="footer-copyright">
              ESITEF. Todos los derechos reservados. {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
