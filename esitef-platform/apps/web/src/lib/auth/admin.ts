import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/ingresar?callbackUrl=/admin/orders");
  }
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }
  return session;
}

export async function isAdminSession() {
  const session = await auth();
  return session?.user?.role === "admin";
}

/** Para API routes: devuelve null en lugar de redirect. */
export async function requireAdminApi() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") return null;
  return session;
}
