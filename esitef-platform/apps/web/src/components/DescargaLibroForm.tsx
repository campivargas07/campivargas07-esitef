"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  LIBRO_PROFESIONES,
  type Libro,
} from "@/lib/libros";
import "@/styles/descarga-libro.css";

type Props = {
  libro: Libro;
};

export function DescargaLibroForm({ libro }: Props) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/libros/descarga", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        libroKey: libro.key,
        nombre: form.get("nombre"),
        pais: form.get("pais"),
        ciudad: form.get("ciudad"),
        telefono: form.get("telefono"),
        email: form.get("email"),
        edad: form.get("edad"),
        profesion: form.get("profesion"),
      }),
    });

    const data = (await res.json()) as { pdfUrl?: string };
    if (!res.ok) {
      setStatus("error");
      return;
    }

    setPdfUrl(data.pdfUrl ?? libro.pdf_url ?? null);
    setStatus("success");
    if (data.pdfUrl) {
      window.open(data.pdfUrl, "_blank");
    }
  }

  return (
    <section className="descarga-libro-section" aria-label={libro.title}>
      <div className="descarga-libro-inner">
        <div className="descarga-libro-cover">
          <img src={libro.image} alt={libro.title} loading="lazy" />
        </div>

        <div className="descarga-libro-module esitef-module-shell">
          <div className="descarga-libro-form-wrap esitef-module-card">
            {status === "success" ? (
              <div className="descarga-libro-success">
                <h1 className="descarga-libro-title">¡Listo!</h1>
                <p className="descarga-libro-subtitle">
                  Gracias por tus datos. Tu descarga comenzará en unos segundos.
                </p>
                {pdfUrl && (
                  <a className="descarga-libro-btn" href={pdfUrl} download>
                    Descargar de nuevo
                  </a>
                )}
                <Link className="descarga-libro-back" href="/libros">
                  Volver a libros
                </Link>
              </div>
            ) : (
              <>
                <p className="descarga-libro-eyebrow">{libro.title}</p>
                <h1 className="descarga-libro-title">Descarga gratuita</h1>
                <p className="descarga-libro-lead">
                  Rellena tus datos para recibir el libro en PDF.
                </p>
                {status === "error" && (
                  <p className="descarga-libro-error" role="alert">
                    Revisa los campos e inténtalo de nuevo.
                  </p>
                )}
                <form className="descarga-libro-form" onSubmit={onSubmit} noValidate>
                  <div className="descarga-field">
                    <label htmlFor="descarga-nombre">Nombre y apellidos *</label>
                    <input id="descarga-nombre" name="nombre" required />
                  </div>
                  <div className="descarga-field">
                    <label htmlFor="descarga-pais">País *</label>
                    <input id="descarga-pais" name="pais" required />
                  </div>
                  <div className="descarga-field">
                    <label htmlFor="descarga-ciudad">Ciudad *</label>
                    <input id="descarga-ciudad" name="ciudad" required />
                  </div>
                  <div className="descarga-field">
                    <label htmlFor="descarga-telefono">Teléfono *</label>
                    <input id="descarga-telefono" name="telefono" type="tel" required />
                  </div>
                  <div className="descarga-field">
                    <label htmlFor="descarga-email">Correo electrónico *</label>
                    <input id="descarga-email" name="email" type="email" required />
                  </div>
                  <div className="descarga-field">
                    <label htmlFor="descarga-edad">Edad *</label>
                    <input id="descarga-edad" name="edad" required />
                  </div>
                  <fieldset className="descarga-field descarga-field--radio descarga-field--full">
                    <legend>Profesión *</legend>
                    <ul className="descarga-radio-list">
                      {LIBRO_PROFESIONES.map((profesion, i) => (
                        <li key={profesion}>
                          <input
                            type="radio"
                            id={`descarga-profesion-${i}`}
                            name="profesion"
                            value={profesion}
                            required={i === 0}
                          />
                          <label htmlFor={`descarga-profesion-${i}`}>
                            {profesion}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </fieldset>
                  <button
                    type="submit"
                    className="descarga-libro-btn descarga-field--full"
                    disabled={status === "loading"}
                  >
                    {status === "loading" ? "Enviando…" : "Enviar"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
