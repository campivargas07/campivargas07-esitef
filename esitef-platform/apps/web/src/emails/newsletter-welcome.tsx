import * as React from "react";
import { Button, Heading, Section, Text } from "@react-email/components";
import {
  EsitefEmailLayout,
  esitefEmailStyles,
} from "./components/esitef-layout";

export type NewsletterWelcomeEmailProps = {
  siteUrl: string;
};

export function NewsletterWelcomeEmail({ siteUrl }: NewsletterWelcomeEmailProps) {
  return (
    <EsitefEmailLayout
      preview="Gracias por suscribirte al newsletter de ESITEF"
      siteUrl={siteUrl}
    >
      <Heading style={heading}>¡Bienvenido al newsletter!</Heading>
      <Text style={paragraph}>
        Gracias por suscribirte. Pronto recibirás novedades sobre formaciones,
        contenidos y eventos de ESITEF.
      </Text>
      <Text style={paragraph}>
        Mientras tanto, puedes explorar nuestras formaciones online y
        presenciales.
      </Text>
      <Section style={buttonSection}>
        <Button href={`${siteUrl}/formaciones`} style={button}>
          Ver formaciones
        </Button>
      </Section>
      <Text style={signOff}>— Equipo ESITEF</Text>
    </EsitefEmailLayout>
  );
}

NewsletterWelcomeEmail.PreviewProps = {
  siteUrl: "https://app.esitef.com",
} satisfies NewsletterWelcomeEmailProps;

const heading: React.CSSProperties = {
  color: esitefEmailStyles.text,
  fontSize: "24px",
  fontWeight: 600,
  lineHeight: "32px",
  margin: "0 0 16px",
};

const paragraph: React.CSSProperties = {
  color: esitefEmailStyles.text,
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const buttonSection: React.CSSProperties = {
  margin: "28px 0 8px",
  textAlign: "center",
};

const button: React.CSSProperties = {
  backgroundColor: esitefEmailStyles.brand,
  borderRadius: "999px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "15px",
  fontWeight: 600,
  lineHeight: "100%",
  padding: "14px 28px",
  textDecoration: "none",
};

const signOff: React.CSSProperties = {
  color: esitefEmailStyles.muted,
  fontSize: "14px",
  lineHeight: "22px",
  margin: "8px 0 0",
};

export default NewsletterWelcomeEmail;
