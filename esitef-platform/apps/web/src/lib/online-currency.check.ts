/**
 * ponytail: assert-based self-check for currency country map + resolveOnlinePrice.
 * Run: npx tsx src/lib/online-currency.check.ts
 */
import {
  currencyFromCountry,
  formatOnlineMoney,
  isOnlineCoursePath,
  normalizeOnlineCurrency,
  resolveOnlinePrice,
} from "./online-currency";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(isOnlineCoursePath("/formaciones"), "/formaciones");
assert(isOnlineCoursePath("/formaciones/masterclass"), "hub");
assert(isOnlineCoursePath("/cursos/foo"), "curso");
assert(isOnlineCoursePath("/aprender/foo"), "aula");
assert(!isOnlineCoursePath("/"), "home");
assert(!isOnlineCoursePath("/espana"), "país");

assert(currencyFromCountry("CO") === "COP", "CO → COP");
assert(currencyFromCountry("PE") === "USD", "PE → USD (deferred)");
assert(currencyFromCountry("UY") === "USD", "UY → USD (deferred)");
assert(currencyFromCountry("CL") === "USD", "CL → USD (deferred)");
assert(currencyFromCountry("MX") === "MXN", "MX → MXN");
assert(normalizeOnlineCurrency("PEN") === "USD", "PEN deferred → USD");

const priced = resolveOnlinePrice({
  courseSlug: "comunicat",
  preferred: "COP",
  fallbackCents: 5500,
  fallbackCurrency: "USD",
});
assert(priced.currency === "COP", "comunicat COP from catalog");
assert(priced.amountMinor === 27700000, "comunicat COP amount");
assert(priced.source === "catalog", "catalog source");

const mc = resolveOnlinePrice({
  courseSlug: "masterclass-gestion-fuerzas",
  preferred: "MXN",
  fallbackCents: 19900,
  fallbackCurrency: "USD",
});
assert(mc.currency === "MXN", "masterclass MXN");
assert(mc.amountMinor === 19900, "masterclass 199 MXN");
assert(mc.source === "catalog", "masterclass from catalog not hub USD");

const money = formatOnlineMoney(3500, "USD");
assert(!/[.,]\d{2}\b/.test(money.replace(/\s/g, "")), `no cents in display: ${money}`);
assert(formatOnlineMoney(5500, "EUR").includes("55"), "EUR whole units");

console.log("online-currency.check: ok");
