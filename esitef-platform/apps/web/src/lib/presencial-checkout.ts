import checkoutData from "@/data/presencial-checkout.json";

export type PresencialPlan = {
  name: string;
  price: number;
  amount_display: string;
  period?: string;
  highlight?: boolean;
  features?: string[];
  subscription?: boolean;
};

export type PresencialCheckoutConfig = {
  checkout_enabled: boolean;
  currency: string;
  default_plan: string;
  plans: Record<string, PresencialPlan>;
};

export const PRESENCIAL_CHECKOUT = checkoutData as Record<
  string,
  PresencialCheckoutConfig
>;

export function getPresencialCheckoutConfig(slug: string) {
  return PRESENCIAL_CHECKOUT[slug] ?? null;
}

export function isPresencialCheckoutEnabled(slug: string) {
  return Boolean(getPresencialCheckoutConfig(slug)?.checkout_enabled);
}

export function toStripeAmount(price: number, currency: string): number {
  const zeroDecimal = new Set([
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
  const code = currency.toLowerCase();
  if (zeroDecimal.has(code)) return Math.round(price);
  return Math.round(price * 100);
}
