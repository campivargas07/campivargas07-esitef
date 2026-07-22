import * as React from "react";
import {
  Body,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";
import { EMAIL_ADAPTIVE_CSS, emailFonts, emailTheme } from "@/lib/email-theme";
import { getEmailLogoUrl } from "@/lib/site-url";

const { light } = emailTheme;

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
  const base = siteUrl.replace(/\/$/, "");

  return (
    <Html lang="es">
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>{EMAIL_ADAPTIVE_CSS}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body style={body} className="email-body">
        <Container style={shell}>
          <Container style={card} className="email-card">
            <Section style={accentBar} className="email-accent-bar">
              <Text style={accentSpacer}>&nbsp;</Text>
            </Section>
            <Section style={cardPad}>
              <Section style={logoSection}>
                <Link href={base}>
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
              <Text style={footer} className="email-muted email-footer">
                ESITEF — Formación para profesionales de salud y movimiento
              </Text>
              <Text style={footerLinks} className="email-muted email-footer">
                <Link href={base} style={link} className="email-link">
                  Visitar la web
                </Link>
                {" · "}
                <Link
                  href={`${base}/formaciones`}
                  style={link}
                  className="email-link"
                >
                  Formaciones
                </Link>
                {" · "}
                <Link
                  href={`${base}/contacto`}
                  style={link}
                  className="email-link"
                >
                  Contacto
                </Link>
              </Text>
            </Section>
          </Container>
        </Container>
      </Body>
    </Html>
  );
}

export const esitefEmailStyles = {
  brand: light.brand,
  text: light.text,
  muted: light.muted,
  detailBg: light.detailBg,
  detailBorder: light.detailBorder,
  detailLabel: light.detailLabel,
};

type EmailEyebrowProps = { children: string };
export function EmailEyebrow({ children }: EmailEyebrowProps) {
  return (
    <Text style={eyebrow} className="email-eyebrow">
      {children}
    </Text>
  );
}

type EmailHeadingProps = { children: string };
export function EmailHeading({ children }: EmailHeadingProps) {
  return (
    <Text style={heading} className="email-heading email-text">
      {children}
    </Text>
  );
}

type EmailParagraphProps = { children: ReactNode };
export function EmailParagraph({ children }: EmailParagraphProps) {
  return (
    <Text style={paragraph} className="email-paragraph email-text">
      {children}
    </Text>
  );
}

type EmailDetailRow = { label: string; value: string };
type EmailDetailBoxProps = { rows: EmailDetailRow[] };
export function EmailDetailBox({ rows }: EmailDetailBoxProps) {
  return (
    <Section style={detailBox} className="email-detail-box">
      {rows.map((row) => (
        <Row key={row.label}>
          <Column>
            <Text style={detailLabel} className="email-detail-label">
              {row.label}
            </Text>
            <Text style={detailValue} className="email-detail-value email-text">
              {row.value}
            </Text>
          </Column>
        </Row>
      ))}
    </Section>
  );
}

type EmailButtonProps = { href: string; children: string };
export function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <Section style={buttonSection} className="email-btn-wrap">
      <Link href={href} style={button} className="email-btn">
        {children}
      </Link>
    </Section>
  );
}

type EmailSignOffProps = Record<string, never>;
export function EmailSignOff(_: EmailSignOffProps) {
  return (
    <Text style={signOff} className="email-muted">
      — Equipo ESITEF
    </Text>
  );
}

const body: React.CSSProperties = {
  backgroundColor: light.shell,
  color: light.text,
  fontFamily: emailFonts.body,
  margin: 0,
  padding: "24px 0",
};

const shell: React.CSSProperties = {
  margin: "0 auto",
  maxWidth: "560px",
  padding: "0 16px",
};

const card: React.CSSProperties = {
  backgroundColor: light.card,
  borderRadius: "28px",
  margin: "0 auto",
  maxWidth: "560px",
  overflow: "hidden",
};

const accentBar: React.CSSProperties = {
  backgroundColor: light.brand,
  height: "4px",
  margin: 0,
  padding: 0,
};

const accentSpacer: React.CSSProperties = {
  fontSize: "4px",
  lineHeight: "4px",
  margin: 0,
  padding: 0,
};

const cardPad: React.CSSProperties = {
  padding: "32px 28px",
};

const logoSection: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "24px",
};

const logo: React.CSSProperties = {
  margin: "0 auto",
};

const eyebrow: React.CSSProperties = {
  color: light.muted,
  fontFamily: emailFonts.eyebrow,
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.14em",
  lineHeight: "16px",
  margin: "0 0 10px",
  textTransform: "uppercase",
};

const heading: React.CSSProperties = {
  color: light.text,
  fontFamily: emailFonts.heading,
  fontSize: "26px",
  fontWeight: 700,
  lineHeight: "32px",
  margin: "0 0 16px",
};

const paragraph: React.CSSProperties = {
  color: light.text,
  fontFamily: emailFonts.body,
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const detailBox: React.CSSProperties = {
  backgroundColor: light.detailBg,
  border: `1px solid ${light.detailBorder}`,
  borderRadius: "16px",
  margin: "20px 0",
  padding: "18px 20px",
};

const detailLabel: React.CSSProperties = {
  color: light.detailLabel,
  fontFamily: emailFonts.eyebrow,
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  lineHeight: "14px",
  margin: "0 0 4px",
  textTransform: "uppercase",
};

const detailValue: React.CSSProperties = {
  color: light.text,
  fontFamily: emailFonts.body,
  fontSize: "15px",
  fontWeight: 500,
  lineHeight: "22px",
  margin: "0 0 14px",
};

const buttonSection: React.CSSProperties = {
  margin: "28px 0 8px",
  textAlign: "center",
};

const button: React.CSSProperties = {
  backgroundColor: light.brand,
  borderRadius: "999px",
  color: "#ffffff",
  display: "inline-block",
  fontFamily: emailFonts.body,
  fontSize: "15px",
  fontWeight: 600,
  lineHeight: "100%",
  padding: "14px 28px",
  textDecoration: "none",
};

const signOff: React.CSSProperties = {
  color: light.muted,
  fontSize: "14px",
  lineHeight: "22px",
  margin: "8px 0 0",
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
  color: light.brand,
  textDecoration: "underline",
};
