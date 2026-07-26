"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { trackWhatsAppClick } from "@/components/tracking/TrackingEvents";
import { getWhatsAppUrl } from "@/lib/whatsapp";

const HIDDEN_PREFIXES = ["/admin", "/aprender", "/ingresar"];

const GENERIC_PATHS = new Set([
  "/",
  "/escuela",
  "/contacto",
  "/blog",
  "/formaciones",
  "/online",
  "/libros",
  "/articulos",
  "/mentorias",
  "/preguntas-frecuentes",
  "/talleres-privados",
  "/sesiones-online",
]);

function pageLabel(pathname: string) {
  if (typeof document === "undefined") return "";
  return document.title.replace(/\s*\|.*$/, "").trim() || pathname;
}

function assistCopy(pathname: string) {
  const p = pathname.replace(/\/$/, "") || "/";
  if (
    GENERIC_PATHS.has(p) ||
    p.startsWith("/blog/") ||
    p.startsWith("/articulos/") ||
    p.startsWith("/pais/") ||
    p.startsWith("/presenciales")
  ) {
    return "¿Tienes alguna duda?";
  }
  if (p.split("/").filter(Boolean).length === 1) {
    return "¿Dudas sobre esta formación?";
  }
  return "¿Tienes alguna duda?";
}

function waMessage(label: string) {
  if (!label || /^(inicio|esitef)$/i.test(label)) {
    return "Hola, tengo una consulta sobre ESITEF.";
  }
  return `Hola, tengo una consulta sobre: ${label}`;
}

export function WhatsAppFloatingButton() {
  const pathname = usePathname() ?? "/";
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");

  const hidden = HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  useEffect(() => {
    setOpen(false);
    setLabel(pageLabel(pathname));
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
    };
  }, [open]);

  if (hidden) return null;

  const href = getWhatsAppUrl(waMessage(label));
  if (!href) return null;

  const copy = assistCopy(pathname);

  return (
    <div
      ref={rootRef}
      className={`whatsapp-assist${open ? " is-open" : ""}`}
      onMouseEnter={() => {
        if (window.matchMedia("(hover: hover)").matches) setOpen(true);
      }}
      onMouseLeave={() => {
        if (window.matchMedia("(hover: hover)").matches) setOpen(false);
      }}
    >
      <div
        id={panelId}
        className="whatsapp-assist__panel"
        role="dialog"
        aria-label="Ayuda por WhatsApp"
        hidden={!open}
      >
        <p className="whatsapp-assist__copy">{copy}</p>
        <p className="whatsapp-assist__hint">Te respondemos por chat</p>
        <a
          href={href}
          className="whatsapp-assist__cta"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            trackWhatsAppClick("floating", label || pathname);
            setOpen(false);
          }}
        >
          Escribir por WhatsApp
        </a>
      </div>

      <button
        type="button"
        className="whatsapp-assist__fab"
        aria-label={
          open
            ? "Cerrar ayuda de WhatsApp"
            : "Abrir chat de WhatsApp con ESITEF"
        }
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="whatsapp-assist__icon" aria-hidden>
          {open ? (
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          )}
        </span>
      </button>
    </div>
  );
}
