/**
 * ponytail: wrapper must emit adaptive light/dark meta + table shell.
 * Run: npx tsx src/lib/email-html-wrapper.check.ts
 */
import assert from "node:assert/strict";
import { emailTheme } from "./email-theme";
import { wrapTransactionalEmail } from "./email-html-wrapper";

const { light } = emailTheme;

const html = wrapTransactionalEmail("<p>Hola</p>");

assert(html.includes('content="light dark"'));
assert(html.includes("prefers-color-scheme: dark"));
assert(html.includes("email-accent-bar"));
assert(html.includes("border-radius:28px"));
assert(html.includes("Esitef_logo_icon_preloadeer.png"));
assert(html.includes("Esitef_logo_icon_dark.png"));
assert(html.includes("email-logo-light"));
assert(html.includes("email-logo-dark"));
assert(html.includes(emailTheme.dark.shell));
assert(html.includes(emailTheme.dark.card));
assert(html.includes(`background-color:${light.shell}`), "inline light shell for Gmail fallback");
assert(html.includes(`bgcolor="${light.card}"`), "table bgcolor light fallback");
assert(html.includes('class="email-logo-dark" style="display:none'), "dark logo hidden inline");
assert(html.includes("<p>Hola</p>"));

console.log("email-html-wrapper.check.ts OK");
