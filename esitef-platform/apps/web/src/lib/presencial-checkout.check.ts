/**
 * ponytail: assert-based self-check for presencial checkout routing.
 * Run: npx tsx src/lib/presencial-checkout.check.ts
 */
import {
  filterPresencialPlansForPais,
  getPresencialCheckoutConfig,
  type PresencialPlan,
} from "./presencial-checkout";
import { getPresencialBySlug } from "./presenciales";

type Provider = "paypal" | "stripe" | "blocked";

/** Mirrors api/checkout/presencial/route.ts provider choice. */
function resolvePresencialProvider(
  pais: string | null | undefined,
  planKey: string,
  subscription?: boolean
): Provider {
  const isArgentina = pais === "argentina";
  const isSubscription = Boolean(subscription);
  if (isArgentina && (isSubscription || planKey === "3-cuotas")) {
    return "blocked";
  }
  if (isSubscription) return "stripe";
  return "paypal";
}

const plans: Record<string, PresencialPlan> = {
  reserva: { name: "Reserva", price: 100, amount_display: "100" },
  "3-cuotas": {
    name: "3 cuotas",
    price: 50,
    amount_display: "50",
    subscription: true,
  },
  completo: { name: "Completo", price: 200, amount_display: "200" },
};

const ar = filterPresencialPlansForPais(plans, "argentina");
const mx = filterPresencialPlansForPais(plans, "mexico");

if ("3-cuotas" in ar) throw new Error("Argentina must hide 3-cuotas");
if (!("reserva" in ar) || !("completo" in ar)) {
  throw new Error("Argentina must keep reserva and completo");
}
if (!("3-cuotas" in mx)) throw new Error("Mexico must keep 3-cuotas");

if (resolvePresencialProvider("argentina", "3-cuotas", true) !== "blocked") {
  throw new Error("Argentina 3-cuotas must be blocked");
}
if (resolvePresencialProvider("argentina", "reserva") !== "paypal") {
  throw new Error("Argentina reserva must use PayPal");
}
if (resolvePresencialProvider("mexico", "3-cuotas", true) !== "stripe") {
  throw new Error("Mexico 3-cuotas must use Stripe");
}
if (resolvePresencialProvider("espana", "completo") !== "paypal") {
  throw new Error("España completo must use PayPal");
}

const cases: Array<{
  slug: string;
  pais: string;
  planKey: string;
  provider: Provider;
}> = [
  {
    slug: "dolor-y-movimiento-cordoba",
    pais: "argentina",
    planKey: "reserva",
    provider: "paypal",
  },
  {
    slug: "evaluacion-dinamica-funcional-gdl",
    pais: "mexico",
    planKey: "3-cuotas",
    provider: "stripe",
  },
  {
    slug: "dolor-y-movimiento-arbucies",
    pais: "espana",
    planKey: "completo",
    provider: "paypal",
  },
  {
    slug: "especializacion-movement-coaching-madrid",
    pais: "espana",
    planKey: "3-cuotas",
    provider: "stripe",
  },
  {
    slug: "especializacion-movement-coaching-madrid",
    pais: "espana",
    planKey: "reserva",
    provider: "paypal",
  },
];

for (const { slug, pais, planKey, provider } of cases) {
  const formacion = getPresencialBySlug(slug);
  const config = getPresencialCheckoutConfig(slug);
  const plan = config?.plans[planKey];
  if (!formacion || formacion.pais !== pais) {
    throw new Error(`${slug}: pais mismatch`);
  }
  if (!plan) throw new Error(`${slug}: plan ${planKey} missing`);
  const got = resolvePresencialProvider(pais, planKey, plan.subscription);
  if (got !== provider) {
    throw new Error(`${slug}/${planKey}: expected ${provider}, got ${got}`);
  }
  const visible = filterPresencialPlansForPais(config!.plans, pais);
  if (pais === "argentina" && "3-cuotas" in visible) {
    throw new Error(`${slug}: Argentina must not show 3-cuotas in UI`);
  }
}

const mc = getPresencialCheckoutConfig(
  "especializacion-movement-coaching-madrid"
);
if (!mc?.checkout_enabled) {
  throw new Error("movement-coaching-madrid checkout must be enabled");
}
if (mc.currency !== "EUR") {
  throw new Error("movement-coaching-madrid must be EUR");
}
if (mc.plans.reserva?.price !== 100) {
  throw new Error("movement-coaching-madrid reserva must be 100");
}
if (mc.plans["3-cuotas"]?.price !== 575) {
  throw new Error("movement-coaching-madrid 3-cuotas must be 575");
}
if (mc.plans.completo?.price !== 1725) {
  throw new Error("movement-coaching-madrid completo must be 1725");
}
if (mc.plans["3-cuotas"]!.price * 3 !== mc.plans.completo!.price) {
  throw new Error("movement-coaching-madrid: 3×cuota must equal completo");
}

console.log("presencial-checkout.check.ts OK");
