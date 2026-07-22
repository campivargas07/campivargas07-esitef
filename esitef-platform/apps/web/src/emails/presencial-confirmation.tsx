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

export type PresencialConfirmationEmailProps = {
  siteUrl: string;
  userName?: string | null;
  courseTitle: string;
  sede?: string;
  planName: string;
  amountLabel: string;
  subscription: boolean;
};

export function PresencialConfirmationEmail({
  siteUrl,
  userName,
  courseTitle,
  sede,
  planName,
  amountLabel,
  subscription,
}: PresencialConfirmationEmailProps) {
  const greeting = userName ? `Hola ${userName},` : "Hola,";
  const rows = [
    { label: "Formación", value: courseTitle },
    ...(sede ? [{ label: "Sede", value: sede }] : []),
    { label: "Plan", value: planName },
    { label: "Importe", value: amountLabel },
  ];

  return (
    <EsitefEmailLayout
      preview={`Inscripción confirmada — ${courseTitle}`}
      siteUrl={siteUrl}
    >
      <EmailEyebrow>Inscripción confirmada</EmailEyebrow>
      <EmailHeading>Tu plaza está reservada</EmailHeading>
      <EmailParagraph>{greeting}</EmailParagraph>
      <EmailParagraph>
        Hemos recibido tu pago y tu inscripción presencial ha quedado{" "}
        <strong>confirmada</strong>. Aquí tienes el resumen:
      </EmailParagraph>
      <EmailDetailBox rows={rows} />
      <EmailParagraph>
        {subscription
          ? "Has elegido el plan de 3 pagos mensuales. Los cobros siguientes se realizarán automáticamente en las fechas acordadas."
          : "Pago recibido correctamente. ¡Te esperamos en la formación!"}
      </EmailParagraph>
      <EmailButton href={`${siteUrl.replace(/\/$/, "")}/dashboard`}>
        Ir a mi cuenta
      </EmailButton>
      <EmailSignOff />
    </EsitefEmailLayout>
  );
}

PresencialConfirmationEmail.PreviewProps = {
  siteUrl: "https://app.esitef.com",
  userName: "María",
  courseTitle: "Dolor y Movimiento",
  sede: "Madrid",
  planName: "Pago completo",
  amountLabel: "425 €",
  subscription: false,
} satisfies PresencialConfirmationEmailProps;

export default PresencialConfirmationEmail;
