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

/** ISO 3166-1 alpha-2 for card submit billing (risk / SCA). */
export function paypalBillingCountryForCurrency(
  currency: OnlineCurrency
): string {
  switch (currency) {
    case "MXN":
      return "MX";
    case "ARS":
      return "AR";
    case "COP":
      return "CO";
    case "EUR":
      return "ES";
    default:
      return "US";
  }
}
