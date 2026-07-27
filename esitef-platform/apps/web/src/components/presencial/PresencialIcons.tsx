import type { ReactNode } from "react";
import type { PresencialHeroMeta } from "@/lib/presenciales";

const MONTH_YEAR_RE =
  /^(.+?)\s+((?:ENE|FEB|MAR|ABR|MAY|JUN|JUL|AGO|SEP|SEPT|OCT|NOV|DIC|ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SEPTIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE)\.?\s+\d{4})$/i;

const LOCATION_RE = /^(.+?)\s+(\([A-Za-z]{2,4}\))$/;

/** Desktop: 2 text lines under icon; mobile uses `inline`. */
export function splitPresencialHeroMeta(meta: PresencialHeroMeta): {
  label?: string;
  value: string;
  inline: string;
} {
  if (meta.label) {
    const inline = meta.value.startsWith("(")
      ? `${meta.label} ${meta.value}`
      : `${meta.label}: ${meta.value}`;
    return { label: meta.label, value: meta.value, inline };
  }

  if (meta.icon === "location") {
    const m = meta.value.match(LOCATION_RE);
    if (m) return { label: m[1], value: m[2], inline: meta.value };
  }

  if (meta.icon === "professor") {
    const i = meta.value.trim().indexOf(" ");
    if (i > 0) {
      return {
        label: meta.value.slice(0, i),
        value: meta.value.slice(i + 1).trim(),
        inline: meta.value,
      };
    }
  }

  if (meta.icon === "calendar" || meta.icon === "clock") {
    const m = meta.value.match(MONTH_YEAR_RE);
    if (m) return { label: m[1], value: m[2], inline: meta.value };
  }

  return { value: meta.value, inline: meta.value };
}

export function PresencialHeroIcon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  const props = { viewBox: "0 0 24 24", "aria-hidden": true as const, className };
  switch (icon) {
    case "clock":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "monitor":
      return (
        <svg {...props}>
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    case "professor":
      // Graduation cap — reads as docente better than a generic user.
      return (
        <svg {...props}>
          <path d="M22 10 12 5 2 10l10 5 10-5Z" />
          <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
          <path d="M22 10v6" />
        </svg>
      );
    case "location":
      return (
        <svg {...props}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
  }
}

export function PresencialStatIcon({ statKey }: { statKey: string }) {
  const props = {
    xmlns: "http://www.w3.org/2000/svg",
    width: 48,
    height: 48,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (statKey) {
    case "dirigido":
      return (
        <svg {...props}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "inversion":
      return (
        <svg {...props}>
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
        </svg>
      );
    case "cupo":
      return (
        <svg {...props}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      );
    case "horario":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "fechas":
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
  }
}

export function HtmlBlock({ html }: { html: string }) {
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export function MultilineText({ text }: { text: string }) {
  const lines = text.split(/\r\n|\r|\n/).filter((l) => l.trim());
  return (
    <ul>
      {lines.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  );
}

export function StatValue({
  value,
  statKey,
}: {
  value: string;
  /** When `ubicacion`, auto-prefix schedule lines with a clock icon. */
  statKey?: string;
}) {
  const clock =
    '<span class="stat-inline-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>';
  let html = value.replace(/\n/g, "<br>").replace(/\{clock\}\s*/g, clock);
  if (statKey === "ubicacion") {
    html = html.replace(
      /(<br\s*\/?>)(?!\s*<span class="stat-inline-icon")(\s*)(?=[^<]*(?:\d+\s*[–\-:]\s*\d+|de\s+\d+\s+a\s+\d+)[^<]*h)/gi,
      `$1$2${clock}`
    );
  }
  return <HtmlBlock html={html} />;
}

export function MissionText({ html }: { html: string }) {
  return (
    <div
      className="mission-main-text"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function Section({ children }: { children: ReactNode }) {
  return children;
}
