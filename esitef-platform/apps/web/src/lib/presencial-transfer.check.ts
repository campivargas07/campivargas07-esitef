/**
 * ponytail: assert-based self-check for presencial bank transfer orders.
 * Run: npx tsx src/lib/presencial-transfer.check.ts
 */
import {
  getPresencialCheckoutConfig,
  presencialUsesModalBankCheckout,
} from "./presencial-checkout";
import { getPresencialBySlug } from "./presenciales";

const dolor = getPresencialBySlug("dolor-y-movimiento-cordoba");
const adultos = getPresencialBySlug("autonomia-motriz-adultos-mayores-cordoba");

if (!dolor || !adultos) {
  throw new Error("AR presencial slugs must exist");
}

const dolorCheckout = getPresencialCheckoutConfig("dolor-y-movimiento-cordoba");
if (!dolorCheckout?.checkout_enabled) {
  throw new Error("Dolor Córdoba must show checkout cards");
}
if (!presencialUsesModalBankCheckout("dolor-y-movimiento-cordoba")) {
  throw new Error("Dolor Córdoba must open inscription modal from cards");
}

const adultosCheckout = getPresencialCheckoutConfig(
  "autonomia-motriz-adultos-mayores-cordoba"
);
if (!adultosCheckout?.checkout_enabled) {
  throw new Error("Adultos mayores must show checkout cards");
}
if (!presencialUsesModalBankCheckout("autonomia-motriz-adultos-mayores-cordoba")) {
  throw new Error("Adultos mayores must open inscription modal from cards");
}

if (!dolor.inscription?.whatsapp_url?.includes("5493562435884")) {
  throw new Error("Dolor Córdoba: WhatsApp must use ESITEF main number");
}
if (dolor.inscription?.concept !== "Insc. Dolor CBA") {
  throw new Error("Dolor Córdoba: concept mismatch");
}

const cbu = adultos.inscription?.accounts?.find((a) => a.label === "CBU");
if (cbu?.number !== "0270001420030958950036") {
  throw new Error("Adultos mayores: CBU mismatch");
}
if (!adultos.inscription?.whatsapp_url?.includes("5492617138395")) {
  throw new Error("Adultos mayores: WhatsApp mismatch");
}
if (adultos.inscription?.concept !== "Insc. Adultos CBA") {
  throw new Error("Adultos mayores: concept mismatch");
}

console.log("presencial-transfer.check.ts OK");
