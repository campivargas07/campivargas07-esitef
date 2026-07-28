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

/** Dummy postal codes valid for PayPal risk checks (not collected from buyer). */
export function paypalBillingPostalForCurrency(
  currency: OnlineCurrency
): string {
  switch (currency) {
    case "MXN":
      return "06600";
    case "ARS":
      return "1000";
    case "COP":
      return "110111";
    case "EUR":
      return "28001";
    default:
      return "10001";
  }
}

/** Minimal billing address for CardFields submit (ACDC risk checks). */
export function paypalBillingAddressForCurrency(currency: OnlineCurrency): {
  addressLine1: string;
  adminArea1: string;
  adminArea2: string;
  countryCode: string;
  postalCode: string;
} {
  const countryCode = paypalBillingCountryForCurrency(currency);
  switch (currency) {
    case "MXN":
      return {
        addressLine1: "Av. Reforma 222",
        adminArea1: "CDMX",
        adminArea2: "Ciudad de Mexico",
        countryCode,
        postalCode: "06600",
      };
    case "ARS":
      return {
        addressLine1: "Av. Corrientes 1234",
        adminArea1: "C",
        adminArea2: "Buenos Aires",
        countryCode,
        postalCode: "1000",
      };
    case "COP":
      return {
        addressLine1: "Calle 100 # 19-61",
        adminArea1: "DC",
        adminArea2: "Bogota",
        countryCode,
        postalCode: "110111",
      };
    case "EUR":
      return {
        addressLine1: "Calle Gran Via 1",
        adminArea1: "MD",
        adminArea2: "Madrid",
        countryCode,
        postalCode: "28001",
      };
    default:
      return {
        addressLine1: "1 Main St",
        adminArea1: "NY",
        adminArea2: "New York",
        countryCode,
        postalCode: "10001",
      };
  }
}
