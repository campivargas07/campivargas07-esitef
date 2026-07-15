import type { OnlineCurrency } from "@/lib/online-currency";
import { getCurrencyOption } from "@/lib/online-currency";

type Props = {
  currency: OnlineCurrency;
  className?: string;
  size?: number;
};

/** Circular SVG flags (HatScripts/circle-flags via jsDelivr). */
export function CurrencyFlag({ currency, className, size = 18 }: Props) {
  const { flagIso, label, code } = getCurrencyOption(currency);
  return (
    <img
      className={className}
      src={`https://cdn.jsdelivr.net/gh/HatScripts/circle-flags@2.7.0/flags/${flagIso}.svg`}
      alt=""
      width={size}
      height={size}
      decoding="async"
      title={`${label} (${code})`}
    />
  );
}
