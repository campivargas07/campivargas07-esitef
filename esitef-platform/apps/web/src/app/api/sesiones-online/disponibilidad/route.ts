import { NextResponse } from "next/server";
import { z } from "zod";
import { getTakenSlotsForDate } from "@/lib/sesiones-online-bookings";
import { getAvailableSessionDates } from "@/lib/sesiones-online";

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
  const available = getAvailableSessionDates().includes(fecha);

  return NextResponse.json({
    fecha,
    available,
    takenSlots: available ? getTakenSlotsForDate(fecha) : [],
  });
}
