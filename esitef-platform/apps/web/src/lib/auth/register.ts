import { eq } from "drizzle-orm";
import { z } from "zod";
import { users } from "@esitef/db";
import { getDb } from "@/lib/db";
import { hashPasswordModern } from "@/lib/auth/wordpress-password";
import {
  registerErrorMessages,
  type RegisterErrorCode,
} from "@/lib/auth/register-messages";

export { registerErrorMessages, type RegisterErrorCode };

const registerSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254).transform((e) => e.toLowerCase()),
  password: z.string().min(1),
  passwordConfirm: z.string().min(1),
});

function isStrongPassword(password: string): boolean {
  return password.length > 8 && /[^A-Za-z0-9]/.test(password);
}

export async function registerUser(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirm: string;
}): Promise<{ ok: true } | { ok: false; code: RegisterErrorCode }> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    if (issue?.path[0] === "email") {
      return { ok: false, code: "invalid_email" };
    }
    return { ok: false, code: "missing_fields" };
  }

  const data = parsed.data;

  if (data.password !== data.passwordConfirm) {
    return { ok: false, code: "password_mismatch" };
  }

  if (!isStrongPassword(data.password)) {
    return { ok: false, code: "weak_password" };
  }

  const db = getDb();

  const [existingEmail] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (existingEmail) {
    return { ok: false, code: "email_exists" };
  }

  const displayName =
    `${data.firstName} ${data.lastName}`.trim() || data.email.split("@")[0];
  const passwordHash = await hashPasswordModern(data.password);

  try {
    await db.insert(users).values({
      email: data.email,
      name: displayName,
      role: "student",
      passwordHash,
      passwordMigrated: true,
    });
  } catch {
    return { ok: false, code: "failed" };
  }

  return { ok: true };
}
