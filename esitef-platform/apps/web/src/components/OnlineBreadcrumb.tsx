import Link from "next/link";
import { Fragment } from "react";

type Segment = { label: string; href?: string };

type Props = {
  segments: Segment[];
  variant?: "hub" | "landing";
  "aria-label"?: string;
};

/** Chars before mobile shortening; ponytail: heuristic — measureDOM if tuning needed */
const MOBILE_FULL_MAX = 42;

const TAIL_PARTICLES = new Set([
  "y",
  "e",
  "de",
  "del",
  "la",
  "las",
  "el",
  "los",
  "en",
  "a",
  "al",
]);

export function abbreviateOnlineCategory(label: string): string {
  const norm = label.trim().toLowerCase();
  if (
    norm === "formaciones online" ||
    norm === "formación online" ||
    norm === "formaciones" ||
    (norm.includes("formaci") && norm.includes("online"))
  ) {
    return "Online";
  }
  return label;
}

export function smartTail(label: string, minWords = 2, maxWords = 4): string {
  const words = label.trim().split(/\s+/).filter(Boolean);
  if (words.length <= minWords) return label;

  const limit = Math.min(maxWords, words.length - 1);
  for (let n = limit; n >= minWords; n--) {
    let tail = words.slice(-n);
    while (tail.length > minWords && TAIL_PARTICLES.has(tail[0]!.toLowerCase())) {
      tail = tail.slice(1);
    }
    if (tail.length >= minWords) return tail.join(" ");
  }

  return words.slice(-minWords).join(" ");
}

function joinBreadcrumbPath(...parts: string[]): string {
  return parts.join(" / ");
}

function fitTailToBudget(label: string, budget: number): string {
  if (budget < 1) return "…";
  if (label.length <= budget) return label;

  for (let maxWords = 4; maxWords >= 2; maxWords--) {
    const tail = smartTail(label, 2, maxWords);
    if (tail.length <= budget) return tail;
  }

  const trimmed = label.slice(0, Math.max(budget - 1, 1)).trimEnd();
  return trimmed.length > 0 ? `${trimmed}…` : label.slice(0, budget);
}

export function truncateForMobile(segments: Segment[]): Segment[] {
  if (segments.length <= 1) return segments;

  const first: Segment = {
    ...segments[0]!,
    label: abbreviateOnlineCategory(segments[0]!.label),
  };
  const rest = segments.slice(1);
  const abbreviatedFull = joinBreadcrumbPath(
    first.label,
    ...rest.map((segment) => segment.label)
  );

  if (abbreviatedFull.length <= MOBILE_FULL_MAX) {
    return [first, ...rest];
  }

  const last = rest[rest.length - 1]!;
  const collapseMiddle = segments.length > 2;
  const fixedLen = first.label.length + (collapseMiddle ? 9 : 3);
  const tailBudget = MOBILE_FULL_MAX - fixedLen;
  const tailLabel = fitTailToBudget(last.label, Math.max(tailBudget, 8));
  const tailSegment: Segment = { ...last, label: tailLabel };

  if (!collapseMiddle) {
    return [first, tailSegment];
  }

  return [first, { label: "..." }, tailSegment];
}

function BreadcrumbRow({
  segments,
  baseClass,
}: {
  segments: Segment[];
  baseClass: string;
}) {
  return (
    <>
      {segments.map((seg, i) => (
        <Fragment key={`${seg.label}-${i}`}>
          {i > 0 && (
            <span className={`${baseClass}__sep`} aria-hidden="true">
              /
            </span>
          )}
          {seg.href ? (
            <Link href={seg.href}>{seg.label}</Link>
          ) : seg.label === "..." ? (
            <span className={`${baseClass}__ellipsis`} aria-hidden="true">
              ...
            </span>
          ) : (
            <span className={`${baseClass}__current`}>{seg.label}</span>
          )}
        </Fragment>
      ))}
    </>
  );
}

export function OnlineBreadcrumb({
  segments,
  variant = "hub",
  "aria-label": ariaLabel = "Navegación",
}: Props) {
  const baseClass = variant === "hub" ? "hub-breadcrumb" : "landing-breadcrumb";
  const innerClass =
    variant === "hub" ? "hub-breadcrumb__inner" : "landing-breadcrumb__inner";
  const fullPath = segments.map((s) => s.label).join(" / ");
  const mobileSegments = truncateForMobile(segments);

  return (
    <nav
      className={baseClass}
      aria-label={ariaLabel}
      title={fullPath}
    >
      <div className={`${innerClass} ${innerClass}--desktop`}>
        <BreadcrumbRow segments={segments} baseClass={baseClass} />
      </div>
      <div
        className={`${innerClass} ${innerClass}--mobile`}
        aria-label={fullPath}
        title={fullPath}
      >
        <BreadcrumbRow segments={mobileSegments} baseClass={baseClass} />
      </div>
    </nav>
  );
}
