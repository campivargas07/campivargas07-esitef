import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/admin";
import { listAdminLibroLeads } from "@/lib/admin-libros";

export async function GET(req: Request) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const libroKey = searchParams.get("libroKey") ?? undefined;

  const leads = await listAdminLibroLeads({ libroKey, limit: 100 });
  return NextResponse.json({ leads });
}
