import checkoutData from "@/data/presencial-checkout.json";

export type PresencialPlanBreakdownRow = {
  label: string;
  /** Right-aligned value (single-plan reserve layout). */
  value?: string;
  /** Secondary line under the label (multi-plan cards). */
  detail?: string;
  icon: "card" | "building" | "calendar" | "user" | "check" | "plus";
  tone?: "today" | "balance";
};

export type PresencialPlan = {
  name: string;
  price: number;
  amount_display: string;
  period?: string;
  highlight?: boolean;
  features?: string[];
  subscription?: boolean;
  breakdown?: PresencialPlanBreakdownRow[];
  /** Note below the CTA (e.g. "Total: 425 EUR"). */
  footer_note?: string;
  /** Secondary line inside an emphasized CTA. */
  cta_note?: string;
  /** Solid primary CTA (vs soft secondary). */
  cta_emphasized?: boolean;
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

/** Argentina: sin plan de 3 cuotas / Stripe. */
export function filterPresencialPlansForPais(
  plans: Record<string, PresencialPlan>,
  pais?: string | null
): Record<string, PresencialPlan> {
  if (pais !== "argentina") return plans;
  const next: Record<string, PresencialPlan> = {};
  for (const [key, plan] of Object.entries(plans)) {
    if (key === "3-cuotas" || plan.subscription) continue;
    next[key] = plan;
  }
  return next;
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
