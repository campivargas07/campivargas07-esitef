import type { SVGProps } from "react";
import type { OnlineCurrency } from "@/lib/online-currency";
import { getCurrencyOption } from "@/lib/online-currency";

type Props = {
  currency: OnlineCurrency;
  className?: string;
  size?: number;
};

/** Inline EU flag — CDN `eu.svg` is an empty stub (~18B); european_union works but we keep EUR local. */
function CircleFlagsEuropeanUnion(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      aria-hidden={props["aria-label"] ? undefined : true}
    >
      <mask id="esitef-eu-flag-mask">
        <circle cx="256" cy="256" r="256" fill="#fff" />
      </mask>
      <g mask="url(#esitef-eu-flag-mask)">
        <path fill="#0052b4" d="M0 0h512v512H0z" />
        <path
          fill="#ffda44"
          d="m256 100.2l8.3 25.5H291l-21.7 15.7l8.3 25.6l-21.7-15.8l-21.7 15.8l8.3-25.6l-21.7-15.7h26.8zm-110.2 45.6l24 12.2l18.9-19l-4.2 26.5l23.9 12.2l-26.5 4.2l-4.2 26.5l-12.2-24l-26.5 4.3l19-19zM100.2 256l25.5-8.3V221l15.7 21.7l25.6-8.3l-15.8 21.7l15.8 21.7l-25.6-8.3l-15.7 21.7v-26.8zm45.6 110.2l12.2-24l-19-18.9l26.5 4.2l12.2-23.9l4.2 26.5l26.5 4.2l-24 12.2l4.3 26.5l-19-19zM256 411.8l-8.3-25.5H221l21.7-15.7l-8.3-25.6l21.7 15.8l21.7-15.8l-8.3 25.6l21.7 15.7h-26.8zm110.2-45.6l-24-12.2l-18.9 19l4.2-26.5l-23.9-12.2l26.5-4.2l4.2-26.5l12.2 24l26.5-4.3l-19 19zM411.8 256l-25.5 8.3V291l-15.7-21.7l-25.6 8.3l15.8-21.7l-15.8-21.7l25.6 8.3l15.7-21.7v26.8zm-45.6-110.2l-12.2 24l19 18.9l-26.5-4.2l-12.2 23.9l-4.2-26.5l-26.5-4.2l24-12.2l-4.3-26.5l19 19z"
        />
      </g>
    </svg>
  );
}

/** Circular SVG flags (HatScripts/circle-flags via jsDelivr; EUR inline). */
export function CurrencyFlag({ currency, className, size = 18 }: Props) {
  const { flagIso, label, code } = getCurrencyOption(currency);

  if (currency === "EUR") {
    return (
      <CircleFlagsEuropeanUnion
        className={className}
        width={size}
        height={size}
        aria-label={`${label} (${code})`}
      />
    );
  }

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

/** Same circle-flags system as the currency switcher (for paises sin moneda online). */
export function CircleFlag({
  flagIso,
  label,
  className,
  size = 18,
}: {
  flagIso: string;
  label: string;
  className?: string;
  size?: number;
}) {
  if (flagIso === "european_union" || flagIso === "eu") {
    return (
      <CircleFlagsEuropeanUnion
        className={className}
        width={size}
        height={size}
        aria-label={label}
      />
    );
  }
  return (
    <img
      className={className}
      src={`https://cdn.jsdelivr.net/gh/HatScripts/circle-flags@2.7.0/flags/${flagIso}.svg`}
      alt=""
      width={size}
      height={size}
      decoding="async"
      title={label}
    />
  );
}
