import type { CheckoutAttribution } from "@/lib/attribution";

export function mergeAttributionMetadata(
  metadata: Record<string, unknown>,
  attribution?: CheckoutAttribution | null
): Record<string, unknown> {
  if (!attribution || Object.keys(attribution).length === 0) return metadata;
  return { ...metadata, attribution };
}
