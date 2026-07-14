import type { ReactNode } from "react";

export function PresencialHeroIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "clock":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "monitor":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    case "professor":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="8" r="4" />
        </svg>
      );
    case "location":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
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

export function StatValue({ value }: { value: string }) {
  return <HtmlBlock html={value.replace(/\n/g, "<br>")} />;
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
