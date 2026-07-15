import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ONLINE_CURRENCY_COOKIE,
  currencyFromCountry,
  isOnlineCurrency,
} from "@/lib/online-currency";

export function middleware(request: NextRequest) {
  const existing = request.cookies.get(ONLINE_CURRENCY_COOKIE)?.value;
  if (existing && isOnlineCurrency(existing)) {
    return NextResponse.next();
  }

  const country =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    null;
  const currency = currencyFromCountry(country);
  const response = NextResponse.next();
  response.cookies.set(ONLINE_CURRENCY_COOKIE, currency, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
