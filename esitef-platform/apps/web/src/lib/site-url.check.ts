/**
 * ponytail: logo URL must point at public app asset.
 * Run: npx tsx src/lib/site-url.check.ts
 */
import assert from "node:assert/strict";
import { getEmailLogoUrl, getPublicSiteUrl } from "./site-url";

const base = getPublicSiteUrl();
assert(
  getEmailLogoUrl(base).endsWith("/img/Esitef_logo_icon_preloadeer.png"),
  "logo path"
);
assert(getEmailLogoUrl(base).startsWith("https://"), "logo must be absolute https");

console.log("site-url.check.ts OK");
