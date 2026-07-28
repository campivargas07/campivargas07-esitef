import * as React from "react";
import {
  EmailButton,
  EmailDetailBox,
  EmailEyebrow,
  EmailHeading,
  EmailParagraph,
  EmailSignOff,
  EsitefEmailLayout,
} from "./components/esitef-layout";

export type CoursePurchaseConfirmationEmailProps = {
  siteUrl: string;
  userName?: string | null;
  courseTitle: string;
  amountLabel: string;
  paymentMethodLabel: string;
};

export function CoursePurchaseConfirmationEmail({
  siteUrl,
  userName,
  courseTitle,
  amountLabel,
  paymentMethodLabel,
}: CoursePurchaseConfirmationEmailProps) {
  const greeting = userName ? `Hola ${userName},` : "Hola,";
  const rows = [
    { label: "Formación", value: courseTitle },
    { label: "Importe", value: amountLabel },
    { label: "Método", value: paymentMethodLabel },
  ];

  return (
    <EsitefEmailLayout
      preview={`Ya puedes entrar a ${courseTitle}`}
      siteUrl={siteUrl}
    >
      <EmailEyebrow>Compra confirmada</EmailEyebrow>
      <EmailHeading>Tu acceso está listo</EmailHeading>
      <EmailParagraph>{greeting}</EmailParagraph>
      <EmailParagraph>
        Hemos recibido tu pago y ya tienes acceso a la formación. Aquí tienes
        el resumen:
      </EmailParagraph>
      <EmailDetailBox rows={rows} />
      <EmailParagraph>
        Puedes entrar cuando quieras desde tu cuenta.
      </EmailParagraph>
      <EmailButton href={`${siteUrl.replace(/\/$/, "")}/dashboard`}>
        Ir a mi formación
      </EmailButton>
      <EmailSignOff />
    </EsitefEmailLayout>
  );
}

CoursePurchaseConfirmationEmail.PreviewProps = {
  siteUrl: "https://app.esitef.com",
  userName: "María",
  courseTitle: "Club de Actualización",
  amountLabel: "149 €",
  paymentMethodLabel: "Tarjeta",
} satisfies CoursePurchaseConfirmationEmailProps;

export default CoursePurchaseConfirmationEmail;
