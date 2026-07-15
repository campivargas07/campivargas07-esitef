import { NextResponse } from "next/server";
import { getSesionOnlinePriceFromCookies } from "@/lib/sesiones-online-server";
import { formatSessionPrice } from "@/lib/sesiones-online";
import { isSesionesOnlineSimulation } from "@/lib/sesiones-online-simulation";

export async function GET() {
  const priced = await getSesionOnlinePriceFromCookies();
  return NextResponse.json({
    currency: priced.currency,
    amountMinor: priced.amountMinor,
    formatted: formatSessionPrice(priced.currency, priced.amountMinor),
    source: priced.source,
    simulation: isSesionesOnlineSimulation(),
  });
}
