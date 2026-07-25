export type PasswordResetErrorCode =
  | "invalid_email"
  | "invalid_token"
  | "expired_token"
  | "password_mismatch"
  | "weak_password"
  | "failed";

export const passwordResetErrorMessages: Record<PasswordResetErrorCode, string> =
  {
    invalid_email: "Introduce un email válido.",
    invalid_token: "El enlace no es válido. Solicita uno nuevo.",
    expired_token: "El enlace ha caducado. Solicita uno nuevo.",
    password_mismatch: "Las contraseñas no coinciden.",
    weak_password:
      "La contraseña debe tener más de 8 caracteres e incluir un carácter especial.",
    failed: "No se pudo completar la operación. Inténtalo de nuevo.",
  };
