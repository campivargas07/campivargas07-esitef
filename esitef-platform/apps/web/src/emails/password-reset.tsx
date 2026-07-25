import * as React from "react";
import {
  EmailButton,
  EmailHeading,
  EmailParagraph,
  EmailSignOff,
  EsitefEmailLayout,
} from "./components/esitef-layout";

export type PasswordResetEmailProps = {
  siteUrl: string;
  userName?: string | null;
  resetUrl: string;
};

export function PasswordResetEmail({
  siteUrl,
  userName,
  resetUrl,
}: PasswordResetEmailProps) {
  const greeting = userName ? `Hola ${userName},` : "Hola,";

  return (
    <EsitefEmailLayout preview="Restablece tu contraseña de ESITEF" siteUrl={siteUrl}>
      <EmailHeading>Restablecer contraseña</EmailHeading>
      <EmailParagraph>{greeting}</EmailParagraph>
      <EmailParagraph>
        Recibimos una solicitud para restablecer la contraseña de tu cuenta ESITEF.
        Si fuiste tú, usa el botón de abajo. El enlace caduca en 1 hora.
      </EmailParagraph>
      <EmailButton href={resetUrl}>Elegir nueva contraseña</EmailButton>
      <EmailParagraph>
        Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña
        actual seguirá siendo válida.
      </EmailParagraph>
      <EmailSignOff />
    </EsitefEmailLayout>
  );
}

PasswordResetEmail.PreviewProps = {
  siteUrl: "https://esitef.com",
  userName: "María",
  resetUrl: "https://esitef.com/ingresar/restablecer?token=example",
} satisfies PasswordResetEmailProps;

export default PasswordResetEmail;
