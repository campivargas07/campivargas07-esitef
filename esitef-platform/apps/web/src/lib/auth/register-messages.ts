export const registerErrorMessages = {
  email_exists:
    "Ese email ya está registrado. Inicia sesión o usa otro email.",
  username_exists: "Ese nombre de usuario ya existe. Elige otro.",
  invalid_email: "Introduce un email válido.",
  weak_password:
    "La contraseña debe tener más de 8 caracteres e incluir un carácter especial.",
  missing_fields: "Completa todos los campos obligatorios.",
  password_mismatch: "Las contraseñas no coinciden.",
  failed: "No se pudo crear la cuenta. Inténtalo de nuevo.",
} as const;

export type RegisterErrorCode = keyof typeof registerErrorMessages;
