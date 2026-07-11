"use client";

import { useState } from "react";
import { readJsonResponse } from "@/lib/read-json-response";

export function CheckoutButtons({ courseSlug }: { courseSlug: string }) {
  const [loading, setLoading] = useState<"stripe" | "paypal" | null>(null);

  async function checkout(provider: "stripe" | "paypal") {
    setLoading(provider);
    const res = await fetch(`/api/checkout/${provider}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseSlug }),
    });
    const data = await readJsonResponse<{ url?: string }>(res);
    setLoading(null);
    if (!res.ok) {
      alert(data.error ?? data.message ?? `Error ${res.status}`);
      return;
    }
    if (data.url) {
      window.location.href = data.url;
      return;
    }
    alert(data.message ?? "No se pudo iniciar el pago.");
  }

  return (
    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
      <button
        className="btn btn-primary"
        onClick={() => checkout("stripe")}
        disabled={loading !== null}
      >
        {loading === "stripe" ? "Redirigiendo…" : "Pagar con tarjeta (Stripe)"}
      </button>
      <button
        className="btn btn-outline"
        onClick={() => checkout("paypal")}
        disabled={loading !== null}
      >
        {loading === "paypal" ? "Redirigiendo…" : "Pagar con PayPal"}
      </button>
    </div>
  );
}
