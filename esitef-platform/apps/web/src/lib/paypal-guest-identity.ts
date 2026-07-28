export function normalizeGuestEmail(email: string | null | undefined): string | null {
  const trimmed = email?.trim().toLowerCase() ?? "";
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return null;
  return trimmed;
}

export function normalizeGuestName(name: string | null | undefined): string | null {
  const trimmed = name?.trim().replace(/\s+/g, " ") ?? "";
  if (trimmed.length < 2) return null;
  return trimmed;
}

// ponytail: minimal self-check — run: npx tsx src/lib/paypal-guest-identity.ts
if (process.argv[1]?.endsWith("paypal-guest-identity.ts")) {
  const assert = (cond: boolean, msg: string) => {
    if (!cond) throw new Error(msg);
  };
  assert(normalizeGuestName("  Ana   López ") === "Ana López", "name trim");
  assert(normalizeGuestName("A") === null, "name min length");
  assert(normalizeGuestEmail(" Ana@Example.COM ") === "ana@example.com", "email");
  assert(normalizeGuestEmail("bad") === null, "email invalid");
  console.log("paypal-guest-identity: ok");
}
