import type { PayPalSdkMode } from "@/lib/paypal-sdk-v6";

let sdkLoadPromise: Promise<void> | null = null;

function getScriptUrl(mode: PayPalSdkMode) {
  return mode === "live"
    ? "https://www.paypal.com/web-sdk/v6/core"
    : "https://www.sandbox.paypal.com/web-sdk/v6/core";
}

export function loadPayPalSdkV6(mode: PayPalSdkMode): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("PayPal SDK solo en el navegador."));
  }

  if (window.paypal?.createInstance) {
    return Promise.resolve();
  }

  const existing = document.querySelector<HTMLScriptElement>(
    'script[data-esitef-paypal-sdk="v6"]'
  );
  if (existing?.dataset.loaded === "true" && window.paypal?.createInstance) {
    return Promise.resolve();
  }

  if (!sdkLoadPromise) {
    sdkLoadPromise = new Promise((resolve, reject) => {
      const script = existing ?? document.createElement("script");
      script.src = getScriptUrl(mode);
      script.async = true;
      script.dataset.esitefPaypalSdk = "v6";
      script.onload = () => {
        script.dataset.loaded = "true";
        resolve();
      };
      script.onerror = () => {
        sdkLoadPromise = null;
        reject(new Error("No se pudo cargar el SDK de PayPal."));
      };
      if (!existing) {
        document.body.appendChild(script);
      }
    });
  }

  return sdkLoadPromise;
}
