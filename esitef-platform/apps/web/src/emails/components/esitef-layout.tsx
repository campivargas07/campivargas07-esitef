import * as React from "react";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

const brand = "#e3203a";
const text = "#282828";
const muted = "#696969";

type EsitefEmailLayoutProps = {
  preview: string;
  siteUrl: string;
  children: ReactNode;
};

export function EsitefEmailLayout({
  preview,
  siteUrl,
  children,
}: EsitefEmailLayoutProps) {
  const logoUrl = `${siteUrl}/img/Esitef_logo_icon_preloadeer.png`;

  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img
              src={logoUrl}
              width="56"
              height="56"
              alt="ESITEF"
              style={logo}
            />
          </Section>
          {children}
          <Hr style={hr} />
          <Text style={footer}>
            ESITEF — Formación para profesionales de salud y movimiento
          </Text>
          <Text style={footerLinks}>
            <Link href={siteUrl} style={link}>
              Visitar la web
            </Link>
            {" · "}
            <Link href={`${siteUrl}/formaciones`} style={link}>
              Formaciones
            </Link>
            {" · "}
            <Link href={`${siteUrl}/contacto`} style={link}>
              Contacto
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export const esitefEmailStyles = { brand, text, muted };

const body: React.CSSProperties = {
  backgroundColor: "#f2f2f2",
  fontFamily:
    "'Inter Tight', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  margin: 0,
  padding: "24px 0",
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  margin: "0 auto",
  maxWidth: "560px",
  padding: "32px 28px",
};

const logoSection: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "24px",
};

const logo: React.CSSProperties = {
  margin: "0 auto",
};

const hr: React.CSSProperties = {
  borderColor: "#e5e5e5",
  margin: "28px 0 20px",
};

const footer: React.CSSProperties = {
  color: muted,
  fontSize: "12px",
  lineHeight: "20px",
  margin: "0 0 8px",
  textAlign: "center",
};

const footerLinks: React.CSSProperties = {
  color: muted,
  fontSize: "12px",
  lineHeight: "20px",
  margin: 0,
  textAlign: "center",
};

const link: React.CSSProperties = {
  color: brand,
  textDecoration: "underline",
};
