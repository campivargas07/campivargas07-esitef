/**
 * ponytail: assert-based self-check for escalate/reply parsing + city focus.
 * Run: npx tsx src/lib/support-agent.check.ts
 */
import {
  cityFocusBlurb,
  catalogBlurb,
  parseModelReply,
  shouldEscalateHeuristically,
} from "./support-agent";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(
  shouldEscalateHeuristically("Hola, quiero hablar con una persona")?.startsWith(
    "keyword:"
  ),
  "should detect human handoff phrase"
);
assert(
  shouldEscalateHeuristically("¿Cuánto cuesta el taller de dolor?") === null,
  "normal FAQ must not escalate"
);
assert(
  shouldEscalateHeuristically("Necesito factura de mi compra")?.startsWith(
    "keyword:"
  ),
  "factura must escalate"
);

const reply = parseModelReply("El taller está en https://esitef.com/formaciones");
assert(reply.action === "reply", "plain text is reply");
if (reply.action === "reply") {
  assert(reply.text.includes("esitef.com"), "keeps body");
}

const esc = parseModelReply("ESCALATE: usuario pide reembolso");
assert(esc.action === "escalate", "ESCALATE line escalates");
if (esc.action === "escalate") {
  assert(esc.reason.includes("reembolso"), "keeps reason");
}

assert(
  parseModelReply("").action === "escalate",
  "empty model reply escalates"
);

const catalog = catalogBlurb();
assert(
  !catalog.includes("dolor-y-movimiento-guadalajara"),
  "past Guadalajara dolor must be excluded from catalog"
);
assert(
  !catalog.includes("dolor-y-movimiento-toluca"),
  "past Toluca dolor must be excluded from catalog"
);
assert(
  catalog.includes("especializacion-movement-coaching-guadalajara"),
  "catalog must include Guadalajara coaching"
);

const focus = cityFocusBlurb("¿Hay formaciones en Guadalajara?");
assert(focus.includes("guadalajara"), "city focus must match Guadalajara");
assert(
  !focus.includes("dolor-y-movimiento-guadalajara"),
  "city focus must not list past GDL dolor"
);
assert(
  focus.includes("especializacion-movement-coaching-guadalajara"),
  "city focus must list active GDL coaching"
);

console.log("support-agent.check.ts: ok");
