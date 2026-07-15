import type { PresencialCatalogLink } from "@/lib/presenciales";

const FLAG_CDN =
  "https://cdn.jsdelivr.net/gh/HatScripts/circle-flags@2.7.0/flags";

type Props = {
  link: PresencialCatalogLink;
  className?: string;
  size?: number;
};

export function PaisFlag({ link, className, size = 28 }: Props) {
  const sedeLabel = link.sede
    ? ` (${link.sede.charAt(0).toUpperCase()}${link.sede.slice(1)})`
    : "";

  return (
    <img
      className={className}
      src={`${FLAG_CDN}/${link.flagIso}.svg`}
      alt=""
      width={size}
      height={size}
      decoding="async"
      title={`${link.paisTitle}${sedeLabel}`}
    />
  );
}
