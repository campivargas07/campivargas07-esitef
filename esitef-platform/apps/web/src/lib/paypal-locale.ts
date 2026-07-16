import type { OnlineCurrency } from "@/lib/online-currency";

/** BCP-47 tags accepted by PayPal SDK v6 (hyphen, not underscore). */
export function paypalLocaleForCurrency(
  currency: OnlineCurrency
): string | undefined {
  switch (currency) {
    case "MXN":
      return "es-MX";
    case "ARS":
      return "es-AR";
    case "COP":
      return "es-CO";
    case "EUR":
      return "es-ES";
    case "USD":
      return undefined;
    default:
      return undefined;
  }
}
