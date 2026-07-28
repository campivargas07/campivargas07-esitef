type LoadOptions = {
  clientId: string;
  /** Optional; CardFields works without it. Kept for HostedFields/compat. */
  clientToken?: string;
  currency: string;
  /** BCP-47 (hyphen); converted to `xx_XX` for v5 query. */
  locale?: string;
  /** Sandbox-only: forces buyer country for ACDC test cards. */
  buyerCountry?: string;
};

let currentKey: string | null = null;
let currentPromise: Promise<void> | null = null;

function buildUrl({
  clientId,
  currency,
  locale,
  buyerCountry,
}: Omit<LoadOptions, "clientToken">) {
  const params = new URLSearchParams({
    "client-id": clientId,
    components: "buttons,card-fields",
    currency: currency.toUpperCase(),
    intent: "capture",
  });
  if (locale) params.set("locale", locale.replace("-", "_"));
  // Sandbox: force US buyer so ACDC test cards are eligible for US merchants.
  if (buyerCountry) params.set("buyer-country", buyerCountry);
  return `https://www.paypal.com/sdk/js?${params.toString()}`;
}

/**
 * Load PayPal JS SDK v5 (buttons + card-fields).
 * Re-injects the script when clientId/currency/locale/token change.
 */
export function loadPayPalSdkV5(opts: LoadOptions): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("PayPal SDK solo en el navegador."));
  }

  const key = `${opts.clientId}|${opts.currency.toUpperCase()}|${opts.locale ?? ""}|${opts.clientToken?.slice(0, 16) ?? ""}|${opts.buyerCountry ?? ""}`;
  if (currentKey === key && currentPromise) return currentPromise;

  document
    .querySelectorAll<HTMLScriptElement>('script[data-esitef-paypal-sdk="v5"]')
    .forEach((s) => s.remove());
  if (window.paypal) {
    (window as unknown as { paypal?: unknown }).paypal = undefined;
  }

  currentKey = key;
  currentPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = buildUrl(opts);
    script.async = true;
    script.dataset.esitefPaypalSdk = "v5";
    script.dataset.sdkIntegrationSource = "esitef-web";
    if (opts.clientToken) {
      script.setAttribute("data-client-token", opts.clientToken);
    }
    script.onload = () => {
      if (window.paypal) resolve();
      else reject(new Error("PayPal SDK cargó pero window.paypal está vacío."));
    };
    script.onerror = () => {
      currentKey = null;
      currentPromise = null;
      reject(new Error("No se pudo cargar el SDK de PayPal."));
    };
    document.body.appendChild(script);
  });
  return currentPromise;
}
