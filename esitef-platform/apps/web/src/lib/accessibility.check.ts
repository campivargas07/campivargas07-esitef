/**
 * ponytail: assert-based self-check for theme resolution.
 * Run: cd apps/web && npx tsx src/lib/accessibility.check.ts
 */
import {
  DEFAULT_A11Y,
  normalizeA11yPrefs,
  parseA11yCookie,
  resolveDomTheme,
} from "./accessibility";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(DEFAULT_A11Y.theme === "system", "default theme is system");

assert(resolveDomTheme({ ...DEFAULT_A11Y, theme: "dark" }, true) === "dark", "dark cookie → dark dom");
assert(resolveDomTheme({ ...DEFAULT_A11Y, theme: "light" }, true) === "light", "light cookie → light dom");
assert(resolveDomTheme({ ...DEFAULT_A11Y, theme: "system" }, true) === "dark", "system + os dark → dark");
assert(resolveDomTheme({ ...DEFAULT_A11Y, theme: "system" }, false) === "light", "system + os light → light");
assert(resolveDomTheme(DEFAULT_A11Y, null) === "system", "system + unknown os → system attr");

const stale = parseA11yCookie(JSON.stringify({ ...DEFAULT_A11Y, theme: "dark" }));
assert(stale.theme === "dark", "parseA11yCookie keeps dark theme");

const normalized = normalizeA11yPrefs({ ...DEFAULT_A11Y, theme: "bogus" as "dark" });
assert(normalized.theme === "system", "normalizeA11yPrefs fixes invalid theme");

console.log("accessibility.check: ok");
