/**
 * ponytail: assert-based self-check for presencial order labels with sede.
 * Run: npx tsx src/lib/presencial-order-label.check.ts
 */
import {
  formatPresencialOrderLabel,
  formatPresencialSede,
  getPresencialBySlug,
} from "./presenciales";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const formacion = getPresencialBySlug("gestion-funcional-fuerzas-medellin");
assert(formacion, "medellin slug exists");

assert(formatPresencialSede("madrid") === "Madrid", "capitalize sede");
assert(formatPresencialSede("") === "", "empty sede");

const label = formatPresencialOrderLabel({
  formacion,
  planName: "Reserva",
  instanceSlug: "gestion-funcional-fuerzas-medellin",
});
assert(label.includes("Medellin"), "label includes sede");
assert(label.includes("Reserva"), "label includes plan");
assert(label.includes("·"), "label uses sede separator");

const paypalLabel = formatPresencialOrderLabel({
  formacion,
  planName: "Reserva",
  instanceSlug: "gestion-funcional-fuerzas-medellin",
  maxLength: 127,
});
assert(paypalLabel.length <= 127, "paypal label within 127 chars");

console.log("presencial-order-label.check.ts OK");
