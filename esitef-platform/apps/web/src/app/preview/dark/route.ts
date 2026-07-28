import { NextRequest, NextResponse } from "next/server";
import { THEME_PREVIEW_COOKIE, THEME_PREVIEW_VALUE } from "@/lib/accessibility";

const NOINDEX = { "X-Robots-Tag": "noindex, nofollow" };

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set(THEME_PREVIEW_COOKIE, THEME_PREVIEW_VALUE, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });
  for (const [key, value] of Object.entries(NOINDEX)) {
    response.headers.set(key, value);
  }
  return response;
}
