"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LOGO_URL,
  ONLINE_LINKS,
  PAISES,
} from "@/lib/navigation";

type NavUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type Props = {
  user?: NavUser | null;
};

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function SiteNavbar({ user }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSub, setOpenSub] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("nav-v2-locked", menuOpen);
    return () => document.documentElement.classList.remove("nav-v2-locked");
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    setOpenSub(null);
  };

  const toggleSub = (key: string, e: React.MouseEvent) => {
    e.preventDefault();
    setOpenSub((prev) => (prev === key ? null : key));
  };

  const headerClass = [
    "header-default",
    "header-navbar-v2",
    menuOpen ? "menu-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={headerClass} id="masthead">
      <div
        className="navbar-v2-overlay"
        aria-hidden="true"
        onClick={closeMenu}
      />
      <nav className="navbar navbar-right full-width">
        <div className="navbar-brand">
          <Link href="/" rel="home" onClick={closeMenu}>
            <Image
              src={LOGO_URL}
              alt="ESITEF"
              width={120}
              height={40}
              priority
              unoptimized
            />
          </Link>
        </div>

        <button
          type="button"
          className="navbar-toggler"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="burger-line" aria-hidden="true" />
          <span className="burger-line" aria-hidden="true" />
        </button>

        <div className="menu-menu-principal-container">
          <ul id="menu-menu-principal" className="navbar-nav">
            {!user && (
              <li
                className="item-movil-entrar menu-item"
                style={{ "--nav-i": 0 } as React.CSSProperties}
              >
                <Link href="/ingresar" onClick={closeMenu}>
                  Ingresar
                </Link>
              </li>
            )}
            {user && (
              <li
                className="item-movil-entrar menu-item"
                style={{ "--nav-i": 0 } as React.CSSProperties}
              >
                <Link href="/dashboard" onClick={closeMenu}>
                  Mi cuenta
                </Link>
              </li>
            )}

            <li
              className="menu-item"
              style={{ "--nav-i": 1 } as React.CSSProperties}
            >
              <Link href="/la-escuela" onClick={closeMenu}>
                Escuela
              </Link>
            </li>

            <li
              className={`menu-item menu-item-has-children${openSub === "online" ? " sub-open" : ""}`}
              style={{ "--nav-i": 2 } as React.CSSProperties}
            >
              <a href="#" onClick={(e) => toggleSub("online", e)}>
                Online
              </a>
              <ul className="sub-menu">
                {ONLINE_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} onClick={closeMenu}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            <li
              className={`menu-item menu-item-has-children${openSub === "presencial" ? " sub-open" : ""}`}
              style={{ "--nav-i": 3 } as React.CSSProperties}
            >
              <a href="#" onClick={(e) => toggleSub("presencial", e)}>
                Presenciales
              </a>
              <ul className="sub-menu">
                {PAISES.map((pais) => (
                  <li key={pais.slug}>
                    <Link href={`/${pais.slug}`} onClick={closeMenu}>
                      {pais.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            <li
              className="menu-item"
              style={{ "--nav-i": 4 } as React.CSSProperties}
            >
              <Link href="/contacto" onClick={closeMenu}>
                Contacto
              </Link>
            </li>

            <li
              className="nav-mobile-socials"
              aria-label="Redes sociales"
              style={{ "--nav-i": 5 } as React.CSSProperties}
            >
              <a
                href="https://www.instagram.com/esitef_oficial/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://www.facebook.com/esitef.sudamerica"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
            </li>
          </ul>
        </div>

        <div className="navbar-utils">
          <div className="utils-btn">
            {user ? (
              <Link
                className="navbar-profile"
                href="/dashboard"
                title={user.name ?? undefined}
                aria-label={`Mi cuenta: ${user.name ?? user.email}`}
              >
                {user.image ? (
                  <Image
                    src={user.image}
                    alt=""
                    width={40}
                    height={40}
                    className="navbar-profile__avatar"
                    unoptimized
                  />
                ) : (
                  <span className="navbar-profile__avatar navbar-profile__initial">
                    {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
            ) : (
              <Link className="btn-getstarted" href="/ingresar">
                Ingresar
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
