/**
 * Calendario público de formaciones presenciales (datos de presenciales.json).
 */
import paisesData from "@/data/paises.json";
import presencialesData from "@/data/presenciales.json";
import type { OnlineCurrency } from "@/lib/online-currency";

export type PresencialCalendarItem = {
  slug: string;
  title: string;
  imageUrl: string;
  sede: string;
  sedeLabel: string;
  pais: string;
  paisLabel: string;
  /** circle-flags ISO (España = es, no EU) */
  flagIso: string;
  currency?: OnlineCurrency;
  datesLabel: string;
  sortKey: number;
  status: "scheduled" | "tbd" | "postponed";
};

type PresencialRow = {
  page_title?: string;
  page_slug?: string;
  title?: string;
  title_bold?: string;
  subtitle?: string;
  sede?: string;
  pais?: string;
  status?: "past";
  hero_image?: { url?: string; alt?: string };
  hero_meta?: { icon?: string; label?: string; value?: string }[];
};

const PAIS_META: Record<
  string,
  { label: string; currency?: OnlineCurrency; flagIso: string }
> = {
  espana: { label: "España", currency: "EUR", flagIso: "es" },
  mexico: { label: "México", currency: "MXN", flagIso: "mx" },
  argentina: { label: "Argentina", currency: "ARS", flagIso: "ar" },
  colombia: { label: "Colombia", currency: "COP", flagIso: "co" },
  uruguay: { label: "Uruguay", flagIso: "uy" },
  peru: { label: "Perú", flagIso: "pe" },
};

const MONTH: Record<string, number> = {
  ene: 1,
  enero: 1,
  feb: 2,
  febrero: 2,
  mar: 3,
  marzo: 3,
  abr: 4,
  abril: 4,
  may: 5,
  mayo: 5,
  jun: 6,
  junio: 6,
  jul: 7,
  julio: 7,
  ago: 8,
  agosto: 8,
  sep: 9,
  sept: 9,
  septiembre: 9,
  oct: 10,
  octubre: 10,
  nov: 11,
  noviembre: 11,
  dic: 12,
  diciembre: 12,
};

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Título sin ciudad (la sede va aparte con bandera). */
export function displayTitle(p: PresencialRow, sedeLabel: string): string {
  const fromParts = [p.title, p.title_bold]
    .filter(Boolean)
    .join(" ")
    .replace(/:\s*$/, "")
    .trim();
  let t = fromParts || p.page_title?.trim() || p.page_slug || "Formación";
  if (sedeLabel) {
    t = t
      .replace(
        new RegExp(`\\s*[—\\-]\\s*${escapeRegExp(sedeLabel)}\\b.*$`, "i"),
        ""
      )
      .trim();
  }
  // CDMX / México variants in titles
  t = t.replace(/\s*[—\-]\s*CDMX\b.*$/i, "").trim();
  return t || p.page_slug || "Formación";
}

/** Prefer calendar; else presencial hybrid label; else any date-like hero value. */
export function pickDatesLabel(p: PresencialRow): string {
  const meta = p.hero_meta ?? [];
  const calendar = meta.find((m) => m.icon === "calendar")?.value?.trim();
  if (calendar) return calendar;

  const presencial = meta.find(
    (m) =>
      /presencial/i.test(m.label ?? "") ||
      (m.icon === "professor" &&
        /NOV|OCT|SEP|DIC|ENE|FEB|MAR|ABR|MAY|JUN|JUL|AGO|\d{4}/i.test(
          m.value ?? ""
        ))
  )?.value?.trim();
  if (presencial) return presencial;

  for (const m of meta) {
    const v = m.value?.trim();
    if (v && /\d{4}|aplazado|inicio/i.test(v)) return v;
  }
  return "";
}

export function parseSortKey(datesLabel: string): {
  sortKey: number;
  status: PresencialCalendarItem["status"];
} {
  const raw = datesLabel.trim();
  if (!raw) return { sortKey: 9_999_999_999, status: "tbd" };
  if (/aplazado/i.test(raw)) {
    const y = raw.match(/(20\d{2})/)?.[1];
    return {
      sortKey: y ? Number(y) * 10000 + 400 : 9_000_000_000,
      status: "postponed",
    };
  }
  const lower = raw.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  const year = Number(raw.match(/(20\d{2})/)?.[1] ?? "2099");
  let month = 12;
  for (const [name, num] of Object.entries(MONTH)) {
    if (lower.includes(name)) {
      month = num;
      break;
    }
  }
  const dayMatch = raw.match(/(\d{1,2})/);
  const day = dayMatch ? Number(dayMatch[1]) : 1;
  if (
    /^inicio\s*2027$/i.test(raw.trim()) ||
    (/inicio/i.test(raw) && !/\d{1,2}/.test(raw))
  ) {
    return { sortKey: year * 10000 + 100, status: "tbd" };
  }
  return { sortKey: year * 10000 + month * 100 + day, status: "scheduled" };
}

function sedeLabel(sede: string, pais: string): string {
  const paisObj = (
    paisesData as Record<string, { sedes?: { slug: string; name: string }[] }>
  )[pais];
  const found = paisObj?.sedes?.find((s) => s.slug === sede);
  if (found?.name) return found.name;
  return sede
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function getPresencialCalendarItems(): PresencialCalendarItem[] {
  const rows = Object.values(
    presencialesData as Record<string, PresencialRow>
  ).filter((p) => p.page_slug && p.status !== "past");

  const items = rows.map((p) => {
    const pais = p.pais || "";
    const sede = p.sede || "";
    const meta = PAIS_META[pais] ?? {
      label: pais || "—",
      flagIso: "un",
    };
    const sedeName = sedeLabel(sede, pais);
    const datesLabel = pickDatesLabel(p);
    const { sortKey, status } = parseSortKey(datesLabel);
    const imageUrl =
      p.hero_image?.url?.trim() || "/img/nuestras-formaciones-1.webp";

    return {
      slug: p.page_slug!,
      title: displayTitle(p, sedeName),
      imageUrl,
      sede,
      sedeLabel: sedeName,
      pais,
      paisLabel: meta.label,
      flagIso: meta.flagIso,
      currency: meta.currency,
      datesLabel: datesLabel || "Fechas a confirmar",
      sortKey,
      status,
    } satisfies PresencialCalendarItem;
  });

  return items.sort(
    (a, b) => a.sortKey - b.sortKey || a.title.localeCompare(b.title, "es")
  );
}

export function getPresencialCalendarCountries(
  items: PresencialCalendarItem[]
): {
  pais: string;
  label: string;
  flagIso: string;
  currency?: OnlineCurrency;
  count: number;
}[] {
  const map = new Map<
    string,
    {
      pais: string;
      label: string;
      flagIso: string;
      currency?: OnlineCurrency;
      count: number;
    }
  >();
  for (const item of items) {
    const cur = map.get(item.pais);
    if (cur) cur.count += 1;
    else {
      map.set(item.pais, {
        pais: item.pais,
        label: item.paisLabel,
        flagIso: item.flagIso,
        currency: item.currency,
        count: 1,
      });
    }
  }
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label, "es"));
}
