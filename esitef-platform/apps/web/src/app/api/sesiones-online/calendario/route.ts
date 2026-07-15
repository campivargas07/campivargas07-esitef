import { NextResponse } from "next/server";
import { z } from "zod";
import { getAvailableDatesForMonth } from "@/lib/sesiones-online-availability";

const querySchema = z.object({
  year: z.coerce.number().int().min(2020).max(2100),
  month: z.coerce.number().int().min(0).max(11),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse({
    year: searchParams.get("year"),
    month: searchParams.get("month"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  const { year, month } = parsed.data;
  const availableDates = await getAvailableDatesForMonth(year, month);

  return NextResponse.json({ year, month, availableDates });
}
