import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/admin";
import { listAdminLibros } from "@/lib/admin-libros";

export async function GET() {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const libros = await listAdminLibros();
  return NextResponse.json({ libros });
}
