import { eq } from "drizzle-orm";
import { legacyIdentities, users } from "@esitef/db";
import { getDb } from "@/lib/db";
import {
  hashPasswordModern,
  verifyWordPressPassword,
} from "@/lib/auth/wordpress-password";

export async function verifyUserCredentials(
  email: string,
  password: string
): Promise<{ id: string; email: string; name: string | null; role: string } | null> {
  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (!user) return null;

  if (user.passwordHash && user.passwordMigrated) {
    const bcrypt = await import("bcryptjs");
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  const [legacy] = await db
    .select()
    .from(legacyIdentities)
    .where(eq(legacyIdentities.userId, user.id))
    .limit(1);

  if (legacy) {
    const ok = verifyWordPressPassword(password, legacy.legacyPasswordHash);
    if (!ok) {
      const bridged = await verifyViaWordPressBridge(email, password);
      if (!bridged) return null;
    }

    const newHash = await hashPasswordModern(password);
    await db
      .update(users)
      .set({
        passwordHash: newHash,
        passwordMigrated: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    await db
      .update(legacyIdentities)
      .set({ migratedAt: new Date() })
      .where(eq(legacyIdentities.id, legacy.id));

    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  if (user.passwordHash) {
    const bcrypt = await import("bcryptjs");
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  return null;
}

async function verifyViaWordPressBridge(
  email: string,
  password: string
): Promise<boolean> {
  const url = process.env.WP_AUTH_BRIDGE_URL;
  const secret = process.env.WP_AUTH_BRIDGE_SECRET;
  if (!url || !secret) return false;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-ESITEF-Auth-Secret": secret,
      },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { valid?: boolean };
    return Boolean(data.valid);
  } catch {
    return false;
  }
}
