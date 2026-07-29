/**
 * ponytail: assert-based self-check for floating WhatsApp path overrides.
 * Run: npx tsx src/lib/whatsapp.check.ts
 */
import {
  getFloatingWhatsAppNumber,
  getWhatsAppNumber,
  getWhatsAppUrl,
} from "./whatsapp";

const global = getWhatsAppNumber();
if (getFloatingWhatsAppNumber("/") !== global) {
  throw new Error("home floating WA must use global number");
}
if (
  getFloatingWhatsAppNumber("/autonomia-motriz-adultos-mayores-cordoba") !==
  "5492617138395"
) {
  throw new Error("Córdoba adultos mayores must override floating WA");
}
if (
  getFloatingWhatsAppNumber("/autonomia-motriz-adultos-mayores-cordoba/") !==
  "5492617138395"
) {
  throw new Error("trailing slash must normalize for floating WA override");
}

const href = getWhatsAppUrl("hola", "5492617138395");
if (!href?.startsWith("https://wa.me/5492617138395")) {
  throw new Error(`expected Córdoba wa.me url, got ${href}`);
}

console.log("whatsapp.check.ts: ok");
