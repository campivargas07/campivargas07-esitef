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

export const PRESENCIAL_CHECKOUT: Record<string, PresencialCheckoutConfig> = {
  "dolor-y-movimiento-cordoba": {
    checkout_enabled: true,
    currency: "ARS",
    default_plan: "3-cuotas",
    plans: {
      reserva: {
        name: "Reserva",
        price: 100000,
        amount_display: "$100.000 ARS",
        period: "Hoy: depósito · Resto: $350 USD en sede",
        features: ["Reserva tu plaza", "Saldo en el día del curso"],
      },
      "3-cuotas": {
        name: "3 cuotas mensuales",
        price: 150000,
        amount_display: "3 × $150.000 ARS",
        period: "Cobro hoy: 1ª cuota",
        highlight: true,
        features: [
          "Cuotas 2 y 3 automáticas cada 30 días",
          "Total: $450.000 ARS",
        ],
        subscription: true,
      },
      completo: {
        name: "Pago completo",
        price: 400000,
        amount_display: "$400.000 ARS",
        period: "5% de ahorro vs cuotas",
        features: ["Inscripción completa", "Sin cuotas pendientes"],
      },
    },
  },
  "pedagogia-aplicada-montevideo": {
    checkout_enabled: true,
    currency: "USD",
    default_plan: "3-cuotas",
    plans: {
      reserva: {
        name: "Reserva",
        price: 100,
        amount_display: "100 USD",
        period: "Saldo según tarifa vigente en sede",
        features: ["Reserva tu plaza"],
      },
      "3-cuotas": {
        name: "3 cuotas mensuales",
        price: 125,
        amount_display: "3 × 125 USD",
        period: "Cobro hoy: 1ª cuota",
        highlight: true,
        features: ["Cuotas 2 y 3 automáticas", "Total: 375 USD"],
        subscription: true,
      },
      completo: {
        name: "Pago completo",
        price: 325,
        amount_display: "325 USD",
        period: "Pronto pago",
        features: ["Inscripción completa"],
      },
    },
  },
  "dolor-y-movimiento-arbucies": {
    checkout_enabled: true,
    currency: "EUR",
    default_plan: "completo",
    plans: {
      reserva: {
        name: "Reserva",
        price: 100,
        amount_display: "100 EUR",
        period: "+ 325 EUR día del curso",
        features: ["Reserva tu plaza"],
      },
      "3-cuotas": {
        name: "3 cuotas mensuales",
        price: 142,
        amount_display: "3 × 142 EUR",
        period: "Cobro hoy: 1ª cuota",
        highlight: true,
        features: ["Cuotas automáticas"],
        subscription: true,
      },
      completo: {
        name: "Pago completo",
        price: 425,
        amount_display: "425 EUR",
        period: "Inscripción completa",
        features: ["Sin cuotas pendientes"],
      },
    },
  },
  "evaluacion-dinamica-funcional-gdl": {
    checkout_enabled: true,
    currency: "MXN",
    default_plan: "completo",
    plans: {
      reserva: {
        name: "Reserva",
        price: 1000,
        amount_display: "$1.000 MXN",
        period: "+ $4.900 MXN día del curso",
        features: ["Reserva tu plaza"],
      },
      "3-cuotas": {
        name: "3 cuotas mensuales",
        price: 1967,
        amount_display: "3 × $1.967 MXN",
        period: "Cobro hoy: 1ª cuota",
        highlight: true,
        features: ["Total: $5.900 MXN"],
        subscription: true,
      },
      completo: {
        name: "Pago completo",
        price: 5900,
        amount_display: "$5.900 MXN",
        period: "Inscripción completa",
        features: ["Sin cuotas pendientes"],
      },
    },
  },
};

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
