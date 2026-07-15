import { NextResponse } from "next/server";
import {
  ONLINE_CURRENCY_COOKIE,
  isOnlineCurrency,
  normalizeOnlineCurrency,
} from "@/lib/online-currency";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { currency?: string } | null;
  const currency = normalizeOnlineCurrency(body?.currency);
  if (!body?.currency || !isOnlineCurrency(currency)) {
    return NextResponse.json({ error: "Moneda no válida" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true, currency });
  res.cookies.set(ONLINE_CURRENCY_COOKIE, currency, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}
