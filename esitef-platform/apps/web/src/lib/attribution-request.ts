import type { CheckoutAttribution } from "@/lib/attribution";

export function parseAttributionFromBody(body: unknown): CheckoutAttribution | null {
  if (!body || typeof body !== "object") return null;
  const att = (body as { attribution?: unknown }).attribution;
  if (!att || typeof att !== "object") return null;
  return att as CheckoutAttribution;
}
