"use client";

import { useEffect, useMemo, useState } from "react";
import { SesionesOnlineBookingPanel } from "@/components/sesiones-online/SesionesOnlineBookingPanel";
import {
  formatSessionDateLabel,
  toISODate,
  type SessionTimeSlot,
} from "@/lib/sesiones-online";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const;

const MONTH_NAMES = [
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
] as const;

type CalendarCell =
  | { kind: "empty"; key: string }
  | { kind: "day"; key: string; iso: string; day: number; available: boolean };

function buildMonthCells(
  year: number,
  month: number,
  available: Set<string>,
): CalendarCell[] {
  const first = new Date(year, month, 1, 12);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startPad = (first.getDay() + 6) % 7;
  const cells: CalendarCell[] = [];

  for (let i = 0; i < startPad; i++) {
    cells.push({ kind: "empty", key: `pad-${i}` });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const iso = toISODate(new Date(year, month, day, 12));
    cells.push({
      kind: "day",
      key: iso,
      iso,
      day,
      available: available.has(iso),
    });
  }

  return cells;
}

export function SesionesOnlineCalendar() {
  const todayIso = useMemo(() => toISODate(new Date()), []);

  const initial = useMemo(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }, []);

  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [loadingMonth, setLoadingMonth] = useState(true);
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [timeSlot, setTimeSlot] = useState<SessionTimeSlot | null>(null);

  useEffect(() => {
    setTimeSlot(null);
  }, [selectedIso]);

  useEffect(() => {
    let cancelled = false;
    setLoadingMonth(true);

    fetch(
      `/api/sesiones-online/calendario?year=${viewYear}&month=${viewMonth}`,
    )
      .then((res) => res.json())
      .then((data: { availableDates?: string[] }) => {
        if (!cancelled) {
          setAvailableDates(new Set(data.availableDates ?? []));
        }
      })
      .catch(() => {
        if (!cancelled) setAvailableDates(new Set());
      })
      .finally(() => {
        if (!cancelled) setLoadingMonth(false);
      });

    return () => {
      cancelled = true;
    };
  }, [viewYear, viewMonth]);

  const cells = useMemo(
    () => buildMonthCells(viewYear, viewMonth, availableDates),
    [viewYear, viewMonth, availableDates],
  );

  const monthLabel = `${MONTH_NAMES[viewMonth]} ${viewYear}`;

  function shiftMonth(delta: number) {
    const next = new Date(viewYear, viewMonth + delta, 1, 12);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  function clearDate() {
    setSelectedIso(null);
    setTimeSlot(null);
  }

  const phase = !selectedIso ? "date" : !timeSlot ? "time" : "details";

  return (
    <div className="sesiones-online-widget">
      <header className="sesiones-online-widget__header">
        {phase !== "date" ? (
          <button
            type="button"
            className="sesiones-online-widget__back"
            onClick={() => {
              if (phase === "details") {
                setTimeSlot(null);
              } else {
                clearDate();
              }
            }}
          >
            ← Volver
          </button>
        ) : (
          <span
            className="sesiones-online-widget__header-spacer"
            aria-hidden
          />
        )}
        <p className="sesiones-online-widget__phase" role="status">
          {phase === "date" && "Selecciona una fecha"}
          {phase === "time" && "Selecciona un horario"}
          {phase === "details" && "Completa tus datos"}
        </p>
        <span className="sesiones-online-widget__header-spacer" aria-hidden />
      </header>

      <div
        className={[
          "sesiones-online-widget__body",
          phase !== "date" && "sesiones-online-widget__body--split",
          phase === "details" && "sesiones-online-widget__body--details",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="sesiones-online-widget__calendar">
          <div className="sesiones-online-calendar__header">
            <button
              type="button"
              className="sesiones-online-calendar__nav"
              onClick={() => shiftMonth(-1)}
              aria-label="Mes anterior"
            >
              ‹
            </button>
            <h2
              className="sesiones-online-calendar__title"
              id="sesiones-cal-month"
            >
              {monthLabel}
            </h2>
            <button
              type="button"
              className="sesiones-online-calendar__nav"
              onClick={() => shiftMonth(1)}
              aria-label="Mes siguiente"
            >
              ›
            </button>
          </div>

          {loadingMonth && phase === "date" && (
            <p className="sesiones-online-booking__hint" role="status">
              Cargando fechas…
            </p>
          )}

          <div
            className="sesiones-online-calendar__grid"
            role="grid"
            aria-labelledby="sesiones-cal-month"
          >
            {WEEKDAYS.map((label) => (
              <div
                key={label}
                className="sesiones-online-calendar__weekday"
                role="columnheader"
              >
                {label}
              </div>
            ))}

            {cells.map((cell) => {
              if (cell.kind === "empty") {
                return (
                  <div
                    key={cell.key}
                    className="sesiones-online-calendar__cell sesiones-online-calendar__cell--empty"
                    role="gridcell"
                    aria-hidden
                  />
                );
              }

              const isPast = cell.iso < todayIso;
              const isSelected = selectedIso === cell.iso;
              const classNames = [
                "sesiones-online-calendar__cell",
                cell.available && "sesiones-online-calendar__cell--available",
                isPast && "sesiones-online-calendar__cell--past",
                isSelected && "sesiones-online-calendar__cell--selected",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  key={cell.key}
                  type="button"
                  role="gridcell"
                  className={classNames}
                  disabled={!cell.available || isPast || loadingMonth}
                  aria-label={
                    cell.available
                      ? `Sesión disponible el ${formatSessionDateLabel(cell.iso)}`
                      : `${cell.day} de ${monthLabel}, sin cupo`
                  }
                  aria-pressed={isSelected}
                  onClick={() => setSelectedIso(cell.iso)}
                >
                  <span className="sesiones-online-calendar__day">{cell.day}</span>
                  {cell.available && !isPast && (
                    <span className="sesiones-online-calendar__dot" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>

          {phase === "date" && (
            <p className="sesiones-online-calendar__legend">
              <span
                className="sesiones-online-calendar__legend-swatch"
                aria-hidden
              />
              Fechas con cupo disponible
            </p>
          )}
        </div>

        {phase !== "date" && (
          <div className="sesiones-online-widget__divider" aria-hidden />
        )}

        {phase !== "date" && (
          <SesionesOnlineBookingPanel
            dateIso={selectedIso}
            timeSlot={timeSlot}
            phase={phase}
            onTimeSlotChange={setTimeSlot}
            onClearDate={clearDate}
          />
        )}
      </div>

      {phase === "date" && (
        <p className="sesiones-online-widget__hint">
          Elige un día resaltado para ver horarios disponibles.
        </p>
      )}
    </div>
  );
}
