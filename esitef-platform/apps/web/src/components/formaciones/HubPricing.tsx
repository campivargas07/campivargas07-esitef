import Link from "next/link";
import { cookies } from "next/headers";
import { CurrencyFlag } from "@/components/CurrencyFlag";
import type { FormacionHub } from "@/lib/formaciones-online";
import {
  ONLINE_CURRENCY_COOKIE,
  normalizeOnlineCurrency,
  resolveHubPricingDisplay,
} from "@/lib/online-currency";

export async function HubPricing({ hub }: { hub: FormacionHub }) {
  const pricing = hub.pricing as Record<string, unknown> | undefined;
  if (!pricing) return null;

  const cookieStore = await cookies();
  const preferred = normalizeOnlineCurrency(
    cookieStore.get(ONLINE_CURRENCY_COOKIE)?.value
  );
  const display = resolveHubPricingDisplay(pricing, preferred);

  const type = String(pricing.type ?? "single");
  const pricingTitle = pricing.title ? String(pricing.title) : "";
  const title =
    pricingTitle ||
    (type === "plans"
      ? "Selecciona el plan que desees adquirir"
      : "¿Cuánto cuesta adquirir la formación?");

  const href = String(pricing.href ?? hub.cta?.href ?? "#");
  const label = hub.cta?.label ?? "Comprar ahora";

  return (
    <section className="hub-pricing" id="precio">
      <div className="hub-pricing__inner">
        <h2 className="hub-pricing__title">{title}</h2>

        <div className="hub-pricing__single">
          <div className="hub-pricing__price-row">
            <CurrencyFlag
              currency={preferred}
              className="hub-pricing__flag"
            />
            <span className="hub-pricing__price hub-pricing__price--current">
              {display.amountLabel}
              {display.currencyLabel ? ` ${display.currencyLabel}` : ""}
            </span>
          </div>

          {href !== "#" && (
            <Link href={href} className="hub-hero__cta">
              {label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
