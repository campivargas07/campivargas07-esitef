/**
 * ponytail: assert-based self-check for escalate/reply parsing.
 * Run: npx tsx src/lib/support-agent.check.ts
 */
import {
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

console.log("support-agent.check.ts: ok");
