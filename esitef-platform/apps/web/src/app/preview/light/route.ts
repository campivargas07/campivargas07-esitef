import { NextRequest, NextResponse } from "next/server";
import { THEME_PREVIEW_COOKIE } from "@/lib/accessibility";

const NOINDEX = { "X-Robots-Tag": "noindex, nofollow" };

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.delete(THEME_PREVIEW_COOKIE);
  for (const [key, value] of Object.entries(NOINDEX)) {
    response.headers.set(key, value);
  }
  return response;
}
