import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getOpenSlotsForDate,
  isDateBookable,
} from "@/lib/sesiones-online-availability";

const querySchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse({ fecha: searchParams.get("fecha") });

  if (!parsed.success) {
    return NextResponse.json({ error: "fecha inválida" }, { status: 400 });
  }

  const { fecha } = parsed.data;
  const available = await isDateBookable(fecha);
  const openSlots = available ? await getOpenSlotsForDate(fecha) : [];

  return NextResponse.json({
    fecha,
    available,
    openSlots,
    takenSlots: [],
  });
}
