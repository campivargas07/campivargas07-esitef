"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  formatLibroPhone,
  getLibroCountryByIso,
  LIBRO_COUNTRIES,
} from "@/lib/libro-countries";
import {
  getLibroPdfSlotCount,
  LIBRO_PROFESIONES,
  type Libro,
} from "@/lib/libros";
import "@/styles/descarga-libro.css";

type Props = {
  libro: Libro;
};

type PdfItem = {
  pdfUrl: string;
  fileName: string | null;
  slot?: string;
};

function triggerPdfDownload(url: string, fileName?: string | null) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.rel = "noopener";
  if (fileName) anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function triggerPdfDownloads(files: PdfItem[]) {
  files.forEach((file, index) => {
    window.setTimeout(
      () => triggerPdfDownload(file.pdfUrl, file.fileName),
      index * 450
    );
  });
}

export function DescargaLibroForm({ libro }: Props) {
  const pdfCount = getLibroPdfSlotCount(libro);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error" | "no-pdf"
  >("idle");
  const [pdfs, setPdfs] = useState<PdfItem[]>([]);
  const [countryIso, setCountryIso] = useState("ES");

  const selectedCountry = getLibroCountryByIso(countryIso);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);
    const dial = getLibroCountryByIso(
      String(form.get("telefono_pais") ?? countryIso)
    ).dial.replace(/-.*$/, "");
    const phoneNumber = String(form.get("telefono_numero") ?? "").trim();

    const res = await fetch("/api/libros/descarga", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        libroKey: libro.key,
        nombre: form.get("nombre"),
        pais: form.get("pais"),
        ciudad: form.get("ciudad"),
        telefono: formatLibroPhone(dial, phoneNumber),
        email: form.get("email"),
        edad: form.get("edad"),
        profesion: form.get("profesion"),
      }),
    });

    const data = (await res.json()) as {
      pdfs?: PdfItem[];
      pdfUrl?: string | null;
      fileName?: string | null;
    };

    if (!res.ok) {
      setStatus("error");
      return;
    }

    const items =
      data.pdfs && data.pdfs.length > 0
        ? data.pdfs
        : data.pdfUrl
          ? [{ pdfUrl: data.pdfUrl, fileName: data.fileName ?? null }]
          : libro.pdf_url
            ? [{ pdfUrl: libro.pdf_url, fileName: null }]
            : [];

    setPdfs(items);

    if (items.length > 0) {
      triggerPdfDownloads(items);
      setStatus("success");
      return;
    }

    setStatus("no-pdf");
  }

  function onCountryChange(iso2: string) {
    setCountryIso(iso2);
  }

  const submitLabel =
    pdfCount > 1 ? `Descargar ${pdfCount} PDFs` : "Descargar PDF";

  return (
    <section className="descarga-libro-section" aria-label={libro.title}>
      <div className="descarga-libro-inner">
        <div className="descarga-libro-cover">
          <img src={libro.image} alt={libro.title} loading="lazy" />
        </div>

        <div className="descarga-libro-form-wrap">
          {status === "success" || status === "no-pdf" ? (
            <div className="descarga-libro-success">
              <h1 className="descarga-libro-title">¡Listo!</h1>
              <p className="descarga-libro-subtitle">
                {status === "success"
                  ? pdfs.length > 1
                    ? "Tus descargas deberían empezar en unos segundos. Si no, usa los botones de abajo."
                    : "Tu descarga debería empezar en unos segundos. Si no, usa el botón de abajo."
                  : "Hemos guardado tus datos. El PDF aún no está disponible; te avisaremos por email cuando lo esté."}
              </p>
              {pdfs.map((pdf, index) => (
                <button
                  key={pdf.slot ?? pdf.pdfUrl}
                  type="button"
                  className="descarga-libro-btn descarga-libro-btn--stacked"
                  onClick={() => triggerPdfDownload(pdf.pdfUrl, pdf.fileName)}
                >
                  {pdfs.length > 1
                    ? `Descargar PDF ${index + 1}${pdf.fileName ? `: ${pdf.fileName}` : ""}`
                    : "Descargar PDF"}
                </button>
              ))}
              <Link className="descarga-libro-back" href="/libros">
                Volver a libros
              </Link>
            </div>
          ) : (
            <>
              <h1 className="descarga-libro-title">Descarga gratuita</h1>
              <p className="descarga-libro-lead">
                {pdfCount > 1
                  ? `Rellena tus datos para recibir los ${pdfCount} archivos en PDF.`
                  : "Rellena tus datos para recibir el libro en PDF."}
              </p>
              {status === "error" && (
                <p className="descarga-libro-error" role="alert">
                  Revisa los campos e inténtalo de nuevo.
                </p>
              )}
              <form className="descarga-libro-form" onSubmit={onSubmit} noValidate>
                <div className="descarga-field descarga-field--full">
                  <label htmlFor="descarga-nombre">Nombre y apellidos *</label>
                  <input
                    id="descarga-nombre"
                    name="nombre"
                    className="descarga-control"
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="descarga-field">
                  <label htmlFor="descarga-pais">País *</label>
                  <select
                    id="descarga-pais"
                    name="pais"
                    className="descarga-control"
                    required
                    value={selectedCountry.name}
                    onChange={(e) => {
                      const country = LIBRO_COUNTRIES.find(
                        (c) => c.name === e.target.value
                      );
                      if (country) onCountryChange(country.iso2);
                    }}
                  >
                    {LIBRO_COUNTRIES.map((country) => (
                      <option key={country.iso2} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="descarga-field">
                  <label htmlFor="descarga-ciudad">Ciudad *</label>
                  <input
                    id="descarga-ciudad"
                    name="ciudad"
                    className="descarga-control"
                    autoComplete="address-level2"
                    required
                  />
                </div>

                <div className="descarga-field descarga-field--full">
                  <label htmlFor="descarga-telefono-numero">Teléfono *</label>
                  <div className="descarga-phone">
                    <select
                      id="descarga-telefono-prefijo"
                      name="telefono_pais"
                      className="descarga-control descarga-phone__prefix"
                      value={countryIso}
                      onChange={(e) => onCountryChange(e.target.value)}
                      aria-label="Prefijo telefónico"
                    >
                      {LIBRO_COUNTRIES.map((country) => (
                        <option key={country.iso2} value={country.iso2}>
                          {country.dial.replace(/-.*$/, "")}
                        </option>
                      ))}
                    </select>
                    <input
                      id="descarga-telefono-numero"
                      name="telefono_numero"
                      className="descarga-control descarga-phone__number"
                      type="tel"
                      autoComplete="tel-national"
                      inputMode="tel"
                      placeholder="Número de teléfono"
                      required
                    />
                  </div>
                </div>

                <div className="descarga-field descarga-field--full">
                  <label htmlFor="descarga-email">Correo electrónico *</label>
                  <input
                    id="descarga-email"
                    name="email"
                    className="descarga-control"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    spellCheck={false}
                    required
                  />
                </div>

                <div className="descarga-field">
                  <label htmlFor="descarga-edad">Edad *</label>
                  <input
                    id="descarga-edad"
                    name="edad"
                    className="descarga-control"
                    inputMode="numeric"
                    required
                  />
                </div>

                <div className="descarga-field">
                  <label htmlFor="descarga-profesion">Profesión *</label>
                  <select
                    id="descarga-profesion"
                    name="profesion"
                    className="descarga-control"
                    required
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Selecciona
                    </option>
                    {LIBRO_PROFESIONES.map((profesion) => (
                      <option key={profesion} value={profesion}>
                        {profesion}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="descarga-libro-btn descarga-field--full"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Enviando…" : submitLabel}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
