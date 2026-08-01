"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CircleFlag } from "@/components/CurrencyFlag";
import type { PresencialCalendarItem } from "@/lib/presencial-calendar";
import { getPresencialCalendarCountries } from "@/lib/presencial-calendar";
import "@/styles/calendario-presenciales.css";

type Props = {
  items: PresencialCalendarItem[];
};

type MonthGroup = {
  key: string;
  label: string;
  items: PresencialCalendarItem[];
};

const MONTH_ES = [
  "",
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function statusLabel(status: PresencialCalendarItem["status"]) {
  if (status === "postponed") return "Aplazado";
  if (status === "tbd") return "Por confirmar";
  return null;
}

function monthKey(sortKey: number, status: PresencialCalendarItem["status"]) {
  if (status === "tbd" && sortKey >= 9_000_000_000) return "tbd";
  if (status === "postponed") {
    const y = Math.floor(sortKey / 10000);
    return `post-${y}`;
  }
  const y = Math.floor(sortKey / 10000);
  const m = Math.floor((sortKey % 10000) / 100);
  return `${y}-${String(m).padStart(2, "0")}`;
}

function monthLabel(key: string, status: PresencialCalendarItem["status"]) {
  if (key === "tbd") return "Fechas por confirmar";
  if (key.startsWith("post-")) {
    const y = key.replace("post-", "");
    return `Aplazados · ${y}`;
  }
  const [ys, ms] = key.split("-");
  const m = Number(ms);
  return `${MONTH_ES[m] ?? ""} ${ys}`.trim();
}

function groupByMonth(list: PresencialCalendarItem[]): MonthGroup[] {
  const map = new Map<string, MonthGroup>();
  for (const item of list) {
    const key = monthKey(item.sortKey, item.status);
    const cur = map.get(key);
    if (cur) cur.items.push(item);
    else {
      map.set(key, {
        key,
        label: monthLabel(key, item.status),
        items: [item],
      });
    }
  }
  return [...map.values()].sort((a, b) => {
    const aMin = Math.min(...a.items.map((i) => i.sortKey));
    const bMin = Math.min(...b.items.map((i) => i.sortKey));
    return aMin - bMin;
  });
}

function CoursePill({ item }: { item: PresencialCalendarItem }) {
  const badge = statusLabel(item.status);
  return (
    <Link href={`/${item.slug}`} className="cal-pres-link">
      <span className="cal-pres-thumb">
        <Image
          src={item.imageUrl}
          alt=""
          width={56}
          height={56}
          className="cal-pres-thumb-img"
          unoptimized
        />
      </span>
      <span className="cal-pres-link-body">
        <span className="cal-pres-link-title">{item.title}</span>
        <span className="cal-pres-city">
          <CircleFlag
            flagIso={item.flagIso}
            label={item.paisLabel}
            size={16}
            className="cal-pres-city-flag"
          />
          <span className="cal-pres-city-name">{item.sedeLabel}</span>
          <span className="cal-pres-city-sep" aria-hidden>
            ·
          </span>
          <span className="cal-pres-city-date">{item.datesLabel}</span>
        </span>
        {badge ? <span className="cal-pres-badge">{badge}</span> : null}
      </span>
    </Link>
  );
}

const BODY_CLASS = "esitef-cal-pres-page";

export function CalendarioPresencialesLinks({ items }: Props) {
  const [pais, setPais] = useState<string>("all");
  const agendaRef = useRef<HTMLDivElement>(null);
  const countries = useMemo(
    () => getPresencialCalendarCountries(items),
    [items]
  );

  useEffect(() => {
    document.body.classList.add(BODY_CLASS);
    return () => document.body.classList.remove(BODY_CLASS);
  }, []);

  const filtered = useMemo(
    () => (pais === "all" ? items : items.filter((i) => i.pais === pais)),
    [items, pais]
  );

  const months = useMemo(() => groupByMonth(filtered), [filtered]);

  useEffect(() => {
    const root = agendaRef.current;
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      root.querySelectorAll(".cal-pres-month").forEach((el) => {
        el.classList.add("is-inview");
      });
      return;
    }

    const sections = root.querySelectorAll<HTMLElement>(".cal-pres-month");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
          }
        }
      },
      { root: null, rootMargin: "0px 0px -12% 0px", threshold: 0.18 }
    );

    sections.forEach((el) => {
      el.classList.remove("is-inview");
      io.observe(el);
    });

    return () => io.disconnect();
  }, [months]);

  return (
    <div className="cal-pres">
      <div className="cal-pres-shell">
        <header className="cal-pres-hero">
          <h1 className="cal-pres-title">
            Calendario formaciones presenciales
          </h1>
        </header>

        <div
          className="cal-pres-filters"
          role="tablist"
          aria-label="Filtrar por país"
        >
          <button
            type="button"
            role="tab"
            aria-selected={pais === "all"}
            className={
              pais === "all" ? "cal-pres-chip is-active" : "cal-pres-chip"
            }
            onClick={() => setPais("all")}
          >
            Todas
          </button>
          {countries.map((c) => (
            <button
              key={c.pais}
              type="button"
              role="tab"
              aria-selected={pais === c.pais}
              className={
                pais === c.pais ? "cal-pres-chip is-active" : "cal-pres-chip"
              }
              onClick={() => setPais(c.pais)}
            >
              <CircleFlag flagIso={c.flagIso} label={c.label} size={16} />
              <span>
                {c.label}
                <span className="cal-pres-chip-count">{c.count}</span>
              </span>
            </button>
          ))}
        </div>

        <div
          ref={agendaRef}
          className="cal-pres-agenda"
          aria-label="Agenda por mes"
        >
          {months.map((group, monthIndex) => (
            <section
              key={group.key}
              className="cal-pres-month"
              style={{ ["--month-i" as string]: String(monthIndex) }}
            >
              <div className="cal-pres-month-rail" aria-hidden>
                <span className="cal-pres-month-dot" />
                <span className="cal-pres-month-line" />
              </div>
              <div className="cal-pres-month-body">
                <h2 className="cal-pres-month-label">{group.label}</h2>
                <ul className="cal-pres-month-list">
                  {group.items.map((item, itemIndex) => (
                    <li
                      key={item.slug}
                      className="cal-pres-month-item"
                      style={{ ["--item-i" as string]: String(itemIndex) }}
                    >
                      <CoursePill item={item} />
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
