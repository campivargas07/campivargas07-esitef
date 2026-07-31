/**
 * ponytail: honeypot discard logic for newsletter POST.
 * Run: npx tsx src/app/api/newsletter/route.check.ts
 */

function isHoneypotHit(website: string | undefined): boolean {
  return Boolean(website?.trim());
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

assert(!isHoneypotHit(undefined), "empty website is not honeypot");
assert(!isHoneypotHit(""), "blank website is not honeypot");
assert(!isHoneypotHit("   "), "whitespace website is not honeypot");
assert(isHoneypotHit("https://spam.example"), "filled website is honeypot");

console.log("newsletter route.check.ts OK");
