import * as React from "react";
import { Link, Section, Text } from "@react-email/components";
import {
  EmailButton,
  EmailEyebrow,
  EmailHeading,
  EmailParagraph,
  EmailSignOff,
  EsitefEmailLayout,
  esitefEmailStyles,
} from "./components/esitef-layout";
import { emailFonts } from "@/lib/email-theme";

export type LibroPromoItem = {
  title: string;
  href: string;
};

export type LibrosPromoEmailProps = {
  siteUrl: string;
  userName?: string | null;
  books: LibroPromoItem[];
};

/** Asunto sugerido al enviar (aún no cableado a Resend). */
export const LIBROS_PROMO_SUBJECT =
  "📚 Potencia tu práctica clínica: Descarga esta biblioteca gratuita de ESITEF";

export function LibrosPromoEmail({
  siteUrl,
  userName,
  books,
}: LibrosPromoEmailProps) {
  const base = siteUrl.replace(/\/$/, "");
  const greeting = userName ? `Hola, ${userName}:` : "Hola:";

  return (
    <EsitefEmailLayout
      preview="Potencia tu práctica clínica: descarga esta biblioteca gratuita de ESITEF"
      siteUrl={siteUrl}
    >
      <EmailEyebrow>Biblioteca gratuita</EmailEyebrow>
      <EmailHeading>Potencia tu práctica clínica</EmailHeading>
      <EmailParagraph>{greeting}</EmailParagraph>
      <EmailParagraph>
        Para acompañarte en tu camino de crecimiento, hemos preparado una
        selección de material gratuito diseñado para ti. Explora las opciones,
        elige la que más se adapte a tus objetivos actuales y descarga tu PDF
        sin costo:
      </EmailParagraph>

      <Section style={listSection}>
        {books.map((book) => (
          <Section key={book.href} style={bookRow}>
            <Text style={bookTitle} className="email-text">
              {book.title}
            </Text>
            <Text style={bookLinkWrap}>
              <Link href={book.href} style={bookLink} className="email-link">
                Descargar gratis →
              </Link>
            </Text>
          </Section>
        ))}
      </Section>

      <EmailParagraph>
        ¿Buscas profundizar aún más en tu desarrollo? Conoce todas nuestras
        formaciones y certificaciones disponibles aquí:
      </EmailParagraph>
      <EmailButton href={`${base}/formaciones`}>
        Ver formaciones en esitef.com
      </EmailButton>
      <EmailSignOff />
    </EsitefEmailLayout>
  );
}

const listSection: React.CSSProperties = {
  backgroundColor: esitefEmailStyles.detailBg,
  border: `1px solid ${esitefEmailStyles.detailBorder}`,
  borderRadius: "16px",
  margin: "8px 0 20px",
  padding: "8px 20px 4px",
};

const bookRow: React.CSSProperties = {
  borderBottom: `1px solid ${esitefEmailStyles.detailBorder}`,
  margin: 0,
  padding: "14px 0",
};

const bookTitle: React.CSSProperties = {
  color: esitefEmailStyles.text,
  fontFamily: emailFonts.body,
  fontSize: "15px",
  fontWeight: 600,
  lineHeight: "22px",
  margin: "0 0 6px",
};

const bookLinkWrap: React.CSSProperties = {
  margin: 0,
};

const bookLink: React.CSSProperties = {
  color: esitefEmailStyles.brand,
  fontFamily: emailFonts.body,
  fontSize: "14px",
  fontWeight: 600,
  textDecoration: "underline",
};

LibrosPromoEmail.PreviewProps = {
  siteUrl: "https://esitef.com",
  userName: "María",
  books: [
    {
      title: "69 ideas desde la evidencia para la práctica clínica",
      href: "https://esitef.com/descarga-libro-69-ideas",
    },
    {
      title: "DOLOR",
      href: "https://esitef.com/descarga-libro-dolor",
    },
    {
      title: "Fisioterapia desde y para el movimiento",
      href: "https://esitef.com/descarga-libro",
    },
    {
      title: "A mi musa la invento yo — Carlota Torrents",
      href: "https://esitef.com/a-mi-musa-la-invento-yo",
    },
  ],
} satisfies LibrosPromoEmailProps;

export default LibrosPromoEmail;
