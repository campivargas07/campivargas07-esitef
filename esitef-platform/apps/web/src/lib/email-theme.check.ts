/**
 * ponytail: adaptive CSS must expose light fallback + dark tokens + logo swap.
 * Run: npx tsx src/lib/email-theme.check.ts
 */
import assert from "node:assert/strict";
import { EMAIL_ADAPTIVE_CSS, emailTheme } from "./email-theme";

const css = EMAIL_ADAPTIVE_CSS;

assert(css.includes(emailTheme.light.shell), "light shell default");
assert(css.includes(emailTheme.dark.shell), "dark shell in media");
assert(css.includes(emailTheme.dark.card), "dark card in media");
assert(css.includes(".email-logo-light"), "logo light class");
assert(css.includes(".email-logo-dark"), "logo dark class");
assert(
  css.includes(`background-color: ${emailTheme.dark.brand} !important`),
  "cta stays brand red in dark"
);
assert(css.includes("color: #ffffff !important"), "cta text stays white");

console.log("email-theme.check.ts OK");
