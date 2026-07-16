import priceCatalog from "@/data/online-currency-prices.json";

export const ONLINE_CURRENCY_COOKIE = "esitef_online_currency";

/** Navbar currency pill — solo landings/hubs/aula online. */
export function isOnlineCoursePath(pathname: string): boolean {
  return (
    pathname === "/formaciones" ||
    pathname.startsWith("/formaciones/") ||
    pathname.startsWith("/cursos/") ||
    pathname.startsWith("/aprender/")
  );
}

export const ONLINE_CURRENCIES = [
  "USD",
  "EUR",
  "MXN",
  "ARS",
  "COP",
] as const;

export type OnlineCurrency = (typeof ONLINE_CURRENCIES)[number];

/** Stripe Checkout PayPal — presentment currencies only (docs.stripe.com/payments/paypal). */
const STRIPE_PAYPAL_CURRENCIES = new Set<string>([
  "EUR",
  "USD",
  "GBP",
  "CHF",
  "CZK",
  "DKK",
  "NOK",
  "PLN",
  "SEK",
  "AUD",
  "CAD",
  "HKD",
  "NZD",
  "SGD",
]);

/** ponytail: Stripe paused — all online course currencies checkout via PayPal. */
export function usesPayPalCheckout(_currency: OnlineCurrency): boolean {
  return true;
}

/** @deprecated Use usesPayPalCheckout */
export function usesPayPalEmbedded(currency: OnlineCurrency): boolean {
  return usesPayPalCheckout(currency);
}

/** @deprecated Use usesPayPalCheckout */
export function usesDirectPayPal(currency: OnlineCurrency): boolean {
  return usesPayPalCheckout(currency);
}

/** Currencies planned later (geo falls back to USD for now). */
const DEFERRED_CURRENCIES = new Set(["PEN", "UYU", "CLP"]);

export type OnlineCurrencyOption = {
  code: OnlineCurrency;
  /** Short accessible name (not shown in the compact selector). */
  label: string;
  /** ISO 3166-1 alpha-2 (or `eu`) for circular flag icons. */
  flagIso: string;
  /** Emoji fallback for non-selector UI. */
  flag: string;
  locale: string;
};

export const ONLINE_CURRENCY_OPTIONS: OnlineCurrencyOption[] = [
  { code: "USD", label: "Dólar", flagIso: "us", flag: "🇺🇸", locale: "en-US" },
  { code: "EUR", label: "Euro", flagIso: "eu", flag: "🇪🇺", locale: "es-ES" },
  { code: "MXN", label: "Peso MX", flagIso: "mx", flag: "🇲🇽", locale: "es-MX" },
  { code: "ARS", label: "Peso AR", flagIso: "ar", flag: "🇦🇷", locale: "es-AR" },
  { code: "COP", label: "Peso CO", flagIso: "co", flag: "🇨🇴", locale: "es-CO" },
];

/** ISO country → preferred online currency. */
const COUNTRY_CURRENCY: Record<string, OnlineCurrency> = {
  ES: "EUR",
  PT: "EUR",
  FR: "EUR",
  DE: "EUR",
  IT: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  IE: "EUR",
  GR: "EUR",
  FI: "EUR",
  SK: "EUR",
  SI: "EUR",
  EE: "EUR",
  LV: "EUR",
  LT: "EUR",
  CY: "EUR",
  MT: "EUR",
  LU: "EUR",
  HR: "EUR",
  MX: "MXN",
  AR: "ARS",
  CO: "COP",
  // PE / UY / CL → USD until those currencies are activated
};

const ZERO_DECIMAL = new Set([
  "bif",
  "clp",
  "djf",
  "gnf",
  "jpy",
  "kmf",
  "krw",
  "mga",
  "pyg",
  "rwf",
  "ugx",
  "vnd",
  "vuv",
  "xaf",
  "xof",
  "xpf",
]);

type CatalogEntry = Record<string, number>;
type Catalog = Record<string, CatalogEntry>;

const CATALOG = priceCatalog as Catalog;

/**
 * Provisional USD→X rates for display/checkout when a course has no catalog row.
 * Catalog / alt_prices always win over these.
 */
const USD_RATES: Record<OnlineCurrency, number> = {
  USD: 1,
  EUR: 0.92,
  MXN: 17.5,
  ARS: 1100,
  COP: 4100,
};

export type OnlinePriceSource = "catalog" | "fallback" | "converted";

function toUsdMajor(amountMinor: number, currency: OnlineCurrency): number {
  const major = fromStripeAmountMinor(amountMinor, currency);
  const rate = USD_RATES[currency] || 1;
  return major / rate;
}

function convertAmountMinor(
  amountMinor: number,
  from: OnlineCurrency,
  to: OnlineCurrency
): number {
  if (from === to) return amountMinor;
  const usdMajor = toUsdMajor(amountMinor, from);
  // Whole major units only — no centavos in any online currency.
  const targetMajor = Math.round(usdMajor * (USD_RATES[to] || 1));
  return toStripeAmountMinor(targetMajor, to);
}

/** Parse labels like "199 USD", "11 USD", "$1.000 MXN". */
export function parsePriceLabel(
  label: string
): { amountMajor: number; currency: OnlineCurrency } | null {
  const trimmed = label.trim();
  const match = trimmed.match(
    /^\$?\s*([\d.,]+)\s*([A-Za-z€]+)?$/u
  );
  if (!match) return null;
  const rawAmount = match[1];
  const rawCurrency = match[2] ? normalizeOnlineCurrency(match[2]) : "USD";

  let amountMajor: number;
  if (rawAmount.includes(",") && rawAmount.includes(".")) {
    amountMajor = Number(rawAmount.replace(/\./g, "").replace(",", "."));
  } else if (rawAmount.includes(",")) {
    const [, decimals = ""] = rawAmount.split(",");
    amountMajor =
      decimals.length === 3
        ? Number(rawAmount.replace(/,/g, ""))
        : Number(rawAmount.replace(",", "."));
  } else {
    amountMajor = Number(rawAmount.replace(/,/g, ""));
  }
  if (!Number.isFinite(amountMajor)) return null;
  return { amountMajor, currency: rawCurrency };
}

export function formatHubItemPrice(
  priceLabel: string | undefined,
  preferred: OnlineCurrency,
  courseSlug?: string
): string {
  if (!priceLabel && !courseSlug) return "";
  const parsed = priceLabel ? parsePriceLabel(priceLabel) : null;
  const priced = resolveOnlinePrice({
    courseSlug: courseSlug ?? "",
    preferred,
    fallbackCents: parsed
      ? toStripeAmountMinor(parsed.amountMajor, parsed.currency)
      : 0,
    fallbackCurrency: parsed?.currency ?? "USD",
  });
  if (priced.amountMinor <= 0) return priceLabel ?? "";
  return formatOnlineMoney(priced.amountMinor, priced.currency);
}

export function isOnlineCurrency(value: string): value is OnlineCurrency {
  return (ONLINE_CURRENCIES as readonly string[]).includes(value.toUpperCase());
}

export function normalizeOnlineCurrency(value: string | null | undefined): OnlineCurrency {
  if (!value) return "USD";
  const upper = value.toUpperCase().replace("€UROS", "EUR").replace("EUROS", "EUR");
  if (DEFERRED_CURRENCIES.has(upper)) return "USD";
  return isOnlineCurrency(upper) ? upper : "USD";
}

export function currencyFromCountry(countryCode: string | null | undefined): OnlineCurrency {
  if (!countryCode) return "USD";
  return COUNTRY_CURRENCY[countryCode.toUpperCase()] ?? "USD";
}

export function getCurrencyOption(code: OnlineCurrency): OnlineCurrencyOption {
  return (
    ONLINE_CURRENCY_OPTIONS.find((o) => o.code === code) ?? ONLINE_CURRENCY_OPTIONS[0]
  );
}

export function toStripeAmountMinor(amountMajor: number, currency: string): number {
  const code = currency.toLowerCase();
  if (ZERO_DECIMAL.has(code)) return Math.round(amountMajor);
  return Math.round(amountMajor * 100);
}

export function fromStripeAmountMinor(amountMinor: number, currency: string): number {
  const code = currency.toLowerCase();
  if (ZERO_DECIMAL.has(code)) return amountMinor;
  return amountMinor / 100;
}

export function formatOnlineMoney(amountMinor: number, currency: OnlineCurrency): string {
  const option = getCurrencyOption(currency);
  // Online prices are whole units only (no centavos in any currency).
  const major = Math.round(fromStripeAmountMinor(amountMinor, currency));
  return new Intl.NumberFormat(option.locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(major);
}

/**
 * Resolve charge amount for an online course in the preferred currency.
 * Order: catalog preferred → catalog fallback/USD → same-currency fallback → convert.
 */
export function resolveOnlinePrice(params: {
  courseSlug: string;
  preferred: OnlineCurrency;
  fallbackCents: number;
  fallbackCurrency: string;
}): {
  currency: OnlineCurrency;
  amountMinor: number;
  source: OnlinePriceSource;
} {
  const preferred = normalizeOnlineCurrency(params.preferred);
  const catalog = params.courseSlug ? CATALOG[params.courseSlug] : undefined;
  const fallbackCurrency = normalizeOnlineCurrency(params.fallbackCurrency);

  if (catalog?.[preferred] != null) {
    return {
      currency: preferred,
      amountMinor: catalog[preferred],
      source: "catalog",
    };
  }

  if (preferred === fallbackCurrency && params.fallbackCents > 0) {
    return {
      currency: fallbackCurrency,
      amountMinor: params.fallbackCents,
      source: "fallback",
    };
  }

  if (catalog?.[fallbackCurrency] != null) {
    if (preferred === fallbackCurrency) {
      return {
        currency: fallbackCurrency,
        amountMinor: catalog[fallbackCurrency],
        source: "catalog",
      };
    }
    return {
      currency: preferred,
      amountMinor: convertAmountMinor(
        catalog[fallbackCurrency],
        fallbackCurrency,
        preferred
      ),
      source: "converted",
    };
  }

  if (catalog?.USD != null) {
    if (preferred === "USD") {
      return { currency: "USD", amountMinor: catalog.USD, source: "catalog" };
    }
    return {
      currency: preferred,
      amountMinor: convertAmountMinor(catalog.USD, "USD", preferred),
      source: "converted",
    };
  }

  if (params.fallbackCents > 0) {
    if (preferred === fallbackCurrency) {
      return {
        currency: fallbackCurrency,
        amountMinor: params.fallbackCents,
        source: "fallback",
      };
    }
    return {
      currency: preferred,
      amountMinor: convertAmountMinor(
        params.fallbackCents,
        fallbackCurrency,
        preferred
      ),
      source: "converted",
    };
  }

  return {
    currency: fallbackCurrency,
    amountMinor: params.fallbackCents,
    source: "fallback",
  };
}

/** Pick display amount/label from hub pricing + preferred currency. */
export function resolveHubPricingDisplay(
  pricing: Record<string, unknown>,
  preferred: OnlineCurrency
): { amountLabel: string; currencyLabel: string; flag?: string } {
  const baseCurrency = normalizeOnlineCurrency(String(pricing.currency ?? "USD"));
  const baseAmount = String(pricing.price ?? "");
  const altPrices = (pricing.alt_prices as Array<Record<string, string>>) ?? [];
  const courseSlug = String(pricing.course_slug ?? "");

  if (preferred === baseCurrency && baseAmount) {
    return {
      amountLabel: baseAmount,
      currencyLabel: preferred,
      flag: pricing.price_flag ? String(pricing.price_flag) : getCurrencyOption(preferred).flag,
    };
  }

  const alt = altPrices.find((row) => {
    const code = normalizeOnlineCurrency(String(row.currency ?? ""));
    return code === preferred;
  });
  if (alt?.amount) {
    return {
      amountLabel: alt.amount,
      currencyLabel: preferred,
      flag: alt.flag || getCurrencyOption(preferred).flag,
    };
  }

  const parsedBase = parsePriceLabel(`${baseAmount} ${baseCurrency}`);
  const fallbackCents = parsedBase
    ? toStripeAmountMinor(parsedBase.amountMajor, baseCurrency)
    : 0;

  const resolved = resolveOnlinePrice({
    courseSlug,
    preferred,
    fallbackCents,
    fallbackCurrency: baseCurrency,
  });

  if (resolved.amountMinor > 0) {
    return {
      amountLabel: formatOnlineMoney(resolved.amountMinor, resolved.currency),
      currencyLabel: "",
      flag: getCurrencyOption(resolved.currency).flag,
    };
  }

  return {
    amountLabel: baseAmount,
    currencyLabel: baseCurrency,
    flag: getCurrencyOption(baseCurrency).flag,
  };
}
