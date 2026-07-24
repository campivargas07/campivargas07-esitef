import { hashMetaEmail, hashMetaPhone } from "@/lib/conversions/hash";
import type { CheckoutAttribution } from "@/lib/attribution";

const META_API_VERSION = "v21.0";

type PurchaseInput = {
  eventId: string;
  eventSourceUrl: string;
  value: number;
  currency: string;
  email?: string | null;
  phone?: string | null;
  attribution?: CheckoutAttribution | null;
  contentName?: string;
};

export async function sendMetaPurchaseEvent(input: PurchaseInput) {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixelId || !token) return;

  const userData: Record<string, string> = {};
  if (input.email) userData.em = hashMetaEmail(input.email);
  if (input.phone) {
    const hashed = hashMetaPhone(input.phone);
    if (hashed) userData.ph = hashed;
  }
  if (input.attribution?.fbp) userData.fbp = input.attribution.fbp;
  if (input.attribution?.fbc) userData.fbc = input.attribution.fbc;

  const body = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        event_source_url: input.eventSourceUrl,
        action_source: "website",
        user_data: userData,
        custom_data: {
          currency: input.currency.toUpperCase(),
          value: input.value,
          ...(input.contentName ? { content_name: input.contentName } : {}),
        },
      },
    ],
    ...(process.env.META_TEST_EVENT_CODE
      ? { test_event_code: process.env.META_TEST_EVENT_CODE }
      : {}),
  };

  const res = await fetch(
    `https://graph.facebook.com/${META_API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[meta-capi] failed", res.status, text.slice(0, 300));
  }
}
