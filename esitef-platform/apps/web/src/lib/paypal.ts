const PAYPAL_API_BASE =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

export function getPayPalApiBase() {
  return PAYPAL_API_BASE;
}

const ZERO_DECIMAL = new Set([
  "BIF",
  "CLP",
  "DJF",
  "GNF",
  "JPY",
  "KMF",
  "KRW",
  "MGA",
  "PYG",
  "RWF",
  "UGX",
  "VND",
  "VUV",
  "XAF",
  "XOF",
  "XPF",
]);

export function formatPayPalAmount(amountCents: number, currency: string) {
  const code = currency.toUpperCase();
  if (ZERO_DECIMAL.has(code)) return String(Math.round(amountCents));
  return (amountCents / 100).toFixed(2);
}

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const secret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  if (!clientId || !secret) {
    throw new Error(
      "PayPal no está configurado. Añade PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET en .env.local."
    );
  }

  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = (await res.json()) as {
    access_token?: string;
    error_description?: string;
  };

  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description ?? "No se pudo autenticar con PayPal.");
  }

  return data.access_token;
}

export async function createPayPalCheckoutOrder(params: {
  orderId: string;
  amountCents: number;
  currency: string;
  title: string;
  returnUrl: string;
  cancelUrl: string;
}) {
  const token = await getPayPalAccessToken();
  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: params.orderId,
          description: params.title,
          amount: {
            currency_code: params.currency.toUpperCase(),
            value: formatPayPalAmount(params.amountCents, params.currency),
          },
        },
      ],
      application_context: {
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
        user_action: "PAY_NOW",
      },
    }),
  });

  const data = (await res.json()) as {
    id?: string;
    links?: Array<{ rel: string; href: string }>;
    message?: string;
  };

  if (!res.ok) {
    throw new Error(data.message ?? "No se pudo crear la orden en PayPal.");
  }

  const approveUrl = data.links?.find((link) => link.rel === "approve")?.href;
  if (!data.id || !approveUrl) {
    throw new Error("PayPal no devolvió URL de aprobación.");
  }

  return { paypalOrderId: data.id, url: approveUrl };
}

type PayPalCaptureResponse = {
  id?: string;
  status?: string;
  purchase_units?: Array<{
    payments?: { captures?: Array<{ id?: string }> };
  }>;
};

export async function capturePayPalOrder(paypalOrderId: string) {
  const token = await getPayPalAccessToken();
  const res = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = (await res.json()) as PayPalCaptureResponse & { message?: string };
  if (!res.ok) {
    throw new Error(data.message ?? "No se pudo capturar el pago en PayPal.");
  }

  return data;
}

export async function verifyPayPalWebhookSignature(
  headers: Headers,
  event: unknown
) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID?.trim();
  if (!webhookId) return false;

  const transmissionId = headers.get("paypal-transmission-id");
  const transmissionTime = headers.get("paypal-transmission-time");
  const certUrl = headers.get("paypal-cert-url");
  const authAlgo = headers.get("paypal-auth-algo");
  const transmissionSig = headers.get("paypal-transmission-sig");

  if (
    !transmissionId ||
    !transmissionTime ||
    !certUrl ||
    !authAlgo ||
    !transmissionSig
  ) {
    return false;
  }

  const token = await getPayPalAccessToken();
  const res = await fetch(
    `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: webhookId,
        webhook_event: event,
      }),
    }
  );

  const data = (await res.json()) as { verification_status?: string };
  return data.verification_status === "SUCCESS";
}
