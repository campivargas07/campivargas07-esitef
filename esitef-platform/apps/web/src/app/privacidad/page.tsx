import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacidad y cookies | ESITEF",
  description:
    "Política de privacidad, cookies y medición de campañas de ESITEF Online.",
};

export default function PrivacidadPage() {
  return (
    <div className="container legal-page" style={{ padding: "3rem 0", maxWidth: "48rem" }}>
      <h1 style={{ fontFamily: "var(--font-heading)" }}>Privacidad y cookies</h1>
      <p style={{ marginTop: "1rem", color: "var(--color-text-muted)" }}>
        ESITEF trata tus datos para gestionar formaciones, inscripciones, pagos y
        comunicaciones relacionadas con nuestros servicios.
      </p>

      <h2 style={{ marginTop: "2rem", fontSize: "1.15rem" }}>Cookies de analítica</h2>
      <p style={{ marginTop: "0.75rem", color: "var(--color-text-muted)" }}>
        Con tu consentimiento usamos herramientas como Google Analytics (GA4),
        Google Tag Manager y Meta Pixel para medir el uso del sitio y el rendimiento
        de campañas publicitarias. Puedes aceptar todo, solo analítica esencial
        (PostHog de producto) o rechazar el seguimiento desde el banner de cookies.
      </p>

      <h2 style={{ marginTop: "2rem", fontSize: "1.15rem" }}>Publicidad</h2>
      <p style={{ marginTop: "0.75rem", color: "var(--color-text-muted)" }}>
        Si aceptas cookies de marketing, podemos medir conversiones de Meta Ads y
        Google Ads, incluyendo eventos de compra e inscripción. Las compras
        confirmadas también pueden registrarse de forma server-side para mejorar la
        atribución cuando el navegador bloquea cookies.
      </p>

      <h2 style={{ marginTop: "2rem", fontSize: "1.15rem" }}>Tus derechos</h2>
      <p style={{ marginTop: "0.75rem", color: "var(--color-text-muted)" }}>
        Puedes ejercer acceso, rectificación o supresión escribiendo a{" "}
        <a href="mailto:info@esitef.com">info@esitef.com</a>.
      </p>

      <p style={{ marginTop: "2rem" }}>
        <Link href="/">Volver al inicio</Link>
      </p>
    </div>
  );
}
