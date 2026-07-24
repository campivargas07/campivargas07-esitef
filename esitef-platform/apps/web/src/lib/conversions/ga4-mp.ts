import type { CheckoutAttribution } from "@/lib/attribution";

type PurchaseInput = {
  eventId: string;
  value: number;
  currency: string;
  itemId?: string;
  itemName?: string;
  attribution?: CheckoutAttribution | null;
};

export async function sendGa4PurchaseEvent(input: PurchaseInput) {
  const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;
  const clientId = input.attribution?.gaClientId;
  if (!measurementId || !apiSecret || !clientId) return;

  const params: Record<string, string | number> = {
    transaction_id: input.eventId,
    value: input.value,
    currency: input.currency.toUpperCase(),
  };
  if (input.itemId || input.itemName) {
    params.items = JSON.stringify([
      {
        item_id: input.itemId ?? input.eventId,
        item_name: input.itemName ?? "ESITEF purchase",
        price: input.value,
        quantity: 1,
      },
    ]);
  }

  const body = {
    client_id: clientId,
    ...(input.attribution?.gaSessionId
      ? { session_id: input.attribution.gaSessionId }
      : {}),
    events: [
      {
        name: "purchase",
        params,
      },
    ],
  };

  const res = await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[ga4-mp] failed", res.status, text.slice(0, 300));
  }
}
