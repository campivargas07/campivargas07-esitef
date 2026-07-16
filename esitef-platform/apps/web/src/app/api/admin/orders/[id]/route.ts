import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { orders } from "@esitef/db";
import { requireAdminApi } from "@/lib/auth/admin";
import { getDb } from "@/lib/db";
import { grantEnrollmentFromOrder } from "@/lib/lms";

const patchSchema = z.object({
  status: z.enum(["pending", "paid", "failed", "refunded", "cancelled"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  }

  const db = getDb();
  const [existing] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
  }

  const nextStatus = parsed.data.status;
  const wasPaid = existing.status === "paid";

  await db
    .update(orders)
    .set({
      status: nextStatus,
      paidAt:
        nextStatus === "paid"
          ? (existing.paidAt ?? new Date())
          : nextStatus === "refunded" || nextStatus === "cancelled"
            ? existing.paidAt
            : null,
    })
    .where(eq(orders.id, id));

  if (nextStatus === "paid" && !wasPaid) {
    await grantEnrollmentFromOrder(id);
  }

  return NextResponse.json({ status: nextStatus });
}
