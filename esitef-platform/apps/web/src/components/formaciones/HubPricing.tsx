import Link from "next/link";
import type { FormacionHub } from "@/lib/formaciones-online";

export function HubPricing({ hub }: { hub: FormacionHub }) {
  const pricing = hub.pricing as Record<string, unknown> | undefined;
  if (!pricing) return null;

  const type = String(pricing.type ?? "single");
  const pricingTitle = pricing.title ? String(pricing.title) : "";
  const title =
    pricingTitle ||
    (type === "plans"
      ? "Selecciona el plan que desees adquirir"
      : "¿Cuánto cuesta adquirir la formación?");

  const href = String(pricing.href ?? hub.cta?.href ?? "#");
  const label = hub.cta?.label ?? "Comprar ahora";
  const price = String(pricing.price ?? "");
  const currency = String(pricing.currency ?? "USD");
  const altPrices = (pricing.alt_prices as Array<Record<string, string>>) ?? [];

  return (
    <section className="hub-pricing" id="precio">
      <div className="hub-pricing__inner">
        <h2 className="hub-pricing__title">{title}</h2>

        <div className="hub-pricing__single">
          <div className="hub-pricing__price-row">
            {pricing.price_flag ? (
              <span className="hub-pricing__flag" aria-hidden="true">
                {String(pricing.price_flag)}
              </span>
            ) : null}
            <span className="hub-pricing__price hub-pricing__price--current">
              {price} {currency}
            </span>
          </div>

          {altPrices.length > 0 && (
            <ul className="hub-pricing__alt hub-pricing__alt--flags">
              {altPrices.map((alt) => (
                <li key={`${alt.flag}-${alt.currency}`}>
                  <span className="hub-pricing__flag" aria-hidden="true">
                    {alt.flag}
                  </span>
                  <span>
                    {alt.amount} {alt.currency}
                  </span>
                </li>
              ))}
            </ul>
          )}

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
