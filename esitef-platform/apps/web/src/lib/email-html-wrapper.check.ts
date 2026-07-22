/**
 * ponytail: wrapper must emit adaptive light/dark meta + table shell.
 * Run: npx tsx src/lib/email-html-wrapper.check.ts
 */
import assert from "node:assert/strict";
import { wrapTransactionalEmail } from "./email-html-wrapper";

const html = wrapTransactionalEmail("<p>Hola</p>");

assert(html.includes('content="light dark"'));
assert(html.includes("prefers-color-scheme: dark"));
assert(html.includes('bgcolor="#ffffff"'));
assert(html.includes("Esitef_logo_icon_preloadeer.png"));
assert(html.includes("<p>Hola</p>"));

console.log("email-html-wrapper.check.ts OK");
