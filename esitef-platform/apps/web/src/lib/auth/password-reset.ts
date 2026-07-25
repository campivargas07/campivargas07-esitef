import { createHash, randomBytes } from "node:crypto";
import { eq, lt } from "drizzle-orm";
import { passwordResetTokens, users } from "@esitef/db";
import { getDb } from "@/lib/db";
import { hashPasswordModern } from "@/lib/auth/wordpress-password";
import { renderEmailTemplate } from "@/lib/render-email";
import { sendMail } from "@/lib/mail";
import { getPublicSiteUrl } from "@/lib/site-url";
import { PasswordResetEmail } from "@/emails/password-reset";
import type { PasswordResetErrorCode } from "@/lib/auth/password-reset-messages";

export type { PasswordResetErrorCode } from "@/lib/auth/password-reset-messages";
export { passwordResetErrorMessages } from "@/lib/auth/password-reset-messages";

const TOKEN_TTL_MS = 60 * 60 * 1000;

function isStrongPassword(password: string): boolean {
  return password.length > 8 && /[^A-Za-z0-9]/.test(password);
}

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export async function requestPasswordReset(
  email: string
): Promise<{ ok: true } | { ok: false; code: PasswordResetErrorCode }> {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalized)) {
    return { ok: false, code: "invalid_email" };
  }

  const db = getDb();
  const [user] = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1);

  // ponytail: misma respuesta aunque no exista — no filtrar emails
  if (!user) return { ok: true };

  const raw = randomBytes(32).toString("hex");
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.userId, user.id));

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  const siteUrl = getPublicSiteUrl();
  const resetUrl = `${siteUrl}/ingresar/restablecer?token=${raw}`;
  const { html, text } = await renderEmailTemplate(
    PasswordResetEmail({
      siteUrl,
      userName: user.name,
      resetUrl,
    })
  );

  const mail = await sendMail({
    to: user.email,
    subject: "Restablecer contraseña — ESITEF",
    html,
    text,
  });

  if (!mail.ok) {
    return { ok: false, code: "failed" };
  }

  return { ok: true };
}

export async function resetPasswordWithToken(input: {
  token: string;
  password: string;
  passwordConfirm: string;
}): Promise<{ ok: true } | { ok: false; code: PasswordResetErrorCode }> {
  const raw = input.token.trim();
  if (!raw) {
    return { ok: false, code: "invalid_token" };
  }

  if (input.password !== input.passwordConfirm) {
    return { ok: false, code: "password_mismatch" };
  }

  if (!isStrongPassword(input.password)) {
    return { ok: false, code: "weak_password" };
  }

  const db = getDb();
  const tokenHash = hashToken(raw);
  const [row] = await db
    .select({
      id: passwordResetTokens.id,
      userId: passwordResetTokens.userId,
      expiresAt: passwordResetTokens.expiresAt,
    })
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.tokenHash, tokenHash))
    .limit(1);

  if (!row) {
    return { ok: false, code: "invalid_token" };
  }

  if (row.expiresAt.getTime() < Date.now()) {
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.id, row.id));
    return { ok: false, code: "expired_token" };
  }

  const passwordHash = await hashPasswordModern(input.password);

  await db
    .update(users)
    .set({
      passwordHash,
      passwordMigrated: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, row.userId));

  await db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.userId, row.userId));

  // ponytail: limpiar tokens caducados cuando alguien resetea
  await db
    .delete(passwordResetTokens)
    .where(lt(passwordResetTokens.expiresAt, new Date()));

  return { ok: true };
}
