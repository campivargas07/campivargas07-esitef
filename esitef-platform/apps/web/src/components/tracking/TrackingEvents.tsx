"use client";

import { useEffect } from "react";
import { canPushMarketingEvent, pushEvent } from "@/lib/gtm";

type Item = {
  item_id: string;
  item_name: string;
  price?: number;
  quantity?: number;
};

type Props = {
  event: "view_item" | "begin_checkout" | "purchase";
  currency: string;
  value: number;
  items: Item[];
  transactionId?: string;
};

export function TrackingEcommerceEvent({
  event,
  currency,
  value,
  items,
  transactionId,
}: Props) {
  useEffect(() => {
    if (!canPushMarketingEvent()) return;
    pushEvent(event, {
      currency: currency.toUpperCase(),
      value,
      items: JSON.stringify(items),
      ...(transactionId ? { transaction_id: transactionId } : {}),
    });
  }, [event, currency, value, items, transactionId]);

  return null;
}

type LeadProps = {
  method: string;
  contentName?: string;
};

export function TrackingLeadEvent({ method, contentName }: LeadProps) {
  useEffect(() => {
    if (!canPushMarketingEvent()) return;
    pushEvent("generate_lead", {
      method,
      ...(contentName ? { content_name: contentName } : {}),
    });
  }, [method, contentName]);

  return null;
}

export function TrackingSignUpEvent() {
  useEffect(() => {
    if (!canPushMarketingEvent()) return;
    pushEvent("sign_up", { method: "email" });
  }, []);

  return null;
}

export function trackWhatsAppClick(source: string, label?: string) {
  if (!canPushMarketingEvent()) return;
  pushEvent("whatsapp_click", {
    source,
    ...(label ? { content_name: label } : {}),
  });
}

export function trackTransferenciaIntent(courseLabel: string) {
  if (!canPushMarketingEvent()) return;
  pushEvent("transferencia_intent", { content_name: courseLabel });
}
