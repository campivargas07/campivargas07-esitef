/**
 * ponytail: assert-based self-check for forced-light theme.
 * Run: cd apps/web && npx tsx src/lib/accessibility.check.ts
 */
import {
  DEFAULT_A11Y,
  normalizeA11yPrefs,
  parseA11yCookie,
  resolveDomTheme,
  THEME_FORCE_LIGHT,
} from "./accessibility";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(THEME_FORCE_LIGHT, "THEME_FORCE_LIGHT enabled in production");

assert(resolveDomTheme({ ...DEFAULT_A11Y, theme: "dark" }, true) === "light", "dark cookie → light dom");
assert(resolveDomTheme({ ...DEFAULT_A11Y, theme: "system" }, true) === "light", "system cookie → light dom");
assert(resolveDomTheme(DEFAULT_A11Y, true) === "light", "default → light");

const stale = parseA11yCookie(JSON.stringify({ ...DEFAULT_A11Y, theme: "dark" }));
assert(stale.theme === "light", "parseA11yCookie normalizes stale dark theme");

const normalized = normalizeA11yPrefs({ ...DEFAULT_A11Y, theme: "system" });
assert(normalized.theme === "light", "normalizeA11yPrefs coerces system → light");

console.log("accessibility.check: ok");
