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
import { EMAIL_ADAPTIVE_CSS, emailTheme } from "@/lib/email-theme";
import { getEmailLogoUrl } from "@/lib/site-url";

const { light } = emailTheme;
const brand = light.brand;

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
  const logoUrl = getEmailLogoUrl(siteUrl);

  return (
    <Html lang="es">
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>{EMAIL_ADAPTIVE_CSS}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body style={body} className="email-body">
        <Container style={container} className="email-card">
          <Section style={logoSection}>
            <Link href={siteUrl}>
              <Img
                src={logoUrl}
                width="56"
                height="56"
                alt="ESITEF"
                style={logo}
              />
            </Link>
          </Section>
          {children}
          <Hr style={hr} className="email-hr" />
          <Text style={footer} className="email-muted">
            ESITEF — Formación para profesionales de salud y movimiento
          </Text>
          <Text style={footerLinks} className="email-muted">
            <Link href={siteUrl} style={link} className="email-link">
              Visitar la web
            </Link>
            {" · "}
            <Link href={`${siteUrl}/formaciones`} style={link} className="email-link">
              Formaciones
            </Link>
            {" · "}
            <Link href={`${siteUrl}/contacto`} style={link} className="email-link">
              Contacto
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export const esitefEmailStyles = {
  brand,
  text: light.text,
  muted: light.muted,
};

const body: React.CSSProperties = {
  backgroundColor: light.shell,
  color: light.text,
  fontFamily:
    "'Inter Tight', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  margin: 0,
  padding: "24px 0",
};

const container: React.CSSProperties = {
  backgroundColor: light.card,
  color: light.text,
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
  borderColor: light.border,
  margin: "28px 0 20px",
};

const footer: React.CSSProperties = {
  color: light.muted,
  fontSize: "12px",
  lineHeight: "20px",
  margin: "0 0 8px",
  textAlign: "center",
};

const footerLinks: React.CSSProperties = {
  color: light.muted,
  fontSize: "12px",
  lineHeight: "20px",
  margin: 0,
  textAlign: "center",
};

const link: React.CSSProperties = {
  color: brand,
  textDecoration: "underline",
};
