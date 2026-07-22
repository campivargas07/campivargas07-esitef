import * as React from "react";
import {
  EmailButton,
  EmailEyebrow,
  EmailHeading,
  EmailParagraph,
  EmailSignOff,
  EsitefEmailLayout,
} from "./components/esitef-layout";

export type NewsletterWelcomeEmailProps = {
  siteUrl: string;
};

export function NewsletterWelcomeEmail({ siteUrl }: NewsletterWelcomeEmailProps) {
  const base = siteUrl.replace(/\/$/, "");

  return (
    <EsitefEmailLayout
      preview="Gracias por suscribirte al newsletter de ESITEF"
      siteUrl={siteUrl}
    >
      <EmailEyebrow>Newsletter</EmailEyebrow>
      <EmailHeading>¡Bienvenido a la comunidad!</EmailHeading>
      <EmailParagraph>
        Gracias por suscribirte. A partir de ahora recibirás novedades sobre
        formaciones, contenidos y eventos de ESITEF directamente en tu bandeja.
      </EmailParagraph>
      <EmailParagraph>
        Mientras tanto, explora nuestro catálogo de formaciones online y
        presenciales para profesionales de la salud y el movimiento.
      </EmailParagraph>
      <EmailButton href={`${base}/formaciones`}>Ver formaciones</EmailButton>
      <EmailSignOff />
    </EsitefEmailLayout>
  );
}

NewsletterWelcomeEmail.PreviewProps = {
  siteUrl: "https://app.esitef.com",
} satisfies NewsletterWelcomeEmailProps;

export default NewsletterWelcomeEmail;
