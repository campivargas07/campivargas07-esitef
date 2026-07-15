"use client";

import { useEffect, useMemo, useState } from "react";
import { SesionesOnlineBookingPanel } from "@/components/sesiones-online/SesionesOnlineBookingPanel";
import {
  formatSessionDateLabel,
  getAvailableSessionDates,
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

const BOOKING_STEPS = [
  { id: 1, label: "Fecha" },
  { id: 2, label: "Horario" },
  { id: 3, label: "Datos" },
  { id: 4, label: "Pago" },
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

function bookingStep(
  dateIso: string | null,
  timeSlot: SessionTimeSlot | null,
  hasFormData: boolean,
): number {
  if (!dateIso) return 1;
  if (!timeSlot) return 2;
  if (!hasFormData) return 3;
  return 4;
}

export function SesionesOnlineCalendar() {
  const availableSet = useMemo(
    () => new Set(getAvailableSessionDates()),
    [],
  );
  const todayIso = useMemo(() => toISODate(new Date()), []);

  const initial = useMemo(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }, []);

  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [timeSlot, setTimeSlot] = useState<SessionTimeSlot | null>(null);
  const [hasFormData, setHasFormData] = useState(false);

  useEffect(() => {
    setTimeSlot(null);
    setHasFormData(false);
  }, [selectedIso]);

  const cells = useMemo(
    () => buildMonthCells(viewYear, viewMonth, availableSet),
    [viewYear, viewMonth, availableSet],
  );

  const monthLabel = `${MONTH_NAMES[viewMonth]} ${viewYear}`;
  const activeStep = bookingStep(selectedIso, timeSlot, hasFormData);

  function shiftMonth(delta: number) {
    const next = new Date(viewYear, viewMonth + delta, 1, 12);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  return (
    <div className="sesiones-online-flow">
      <ol className="sesiones-online-steps" aria-label="Pasos de reserva">
        {BOOKING_STEPS.map((step) => {
          const isActive = step.id === activeStep;
          const isComplete = step.id < activeStep;
          return (
            <li
              key={step.id}
              className={[
                "sesiones-online-steps__item",
                isActive && "sesiones-online-steps__item--active",
                isComplete && "sesiones-online-steps__item--complete",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="sesiones-online-steps__num" aria-hidden>
                {isComplete ? "✓" : step.id}
              </span>
              <span className="sesiones-online-steps__label">{step.label}</span>
            </li>
          );
        })}
      </ol>

      <div className="sesiones-online-flow__main">
        <div className="sesiones-online-calendar">
          {selectedIso && (
            <div className="sesiones-online-calendar__chip" role="status">
              <span className="sesiones-online-calendar__chip-label">Fecha</span>
              <strong>{formatSessionDateLabel(selectedIso)}</strong>
              <button
                type="button"
                className="sesiones-online-calendar__chip-clear"
                onClick={() => setSelectedIso(null)}
                aria-label="Cambiar fecha seleccionada"
              >
                Cambiar
              </button>
            </div>
          )}

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
                  disabled={!cell.available || isPast}
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

          <p className="sesiones-online-calendar__legend">
            <span
              className="sesiones-online-calendar__legend-swatch"
              aria-hidden
            />
            Fechas con cupo disponible
          </p>
        </div>

        <SesionesOnlineBookingPanel
          dateIso={selectedIso}
          timeSlot={timeSlot}
          onTimeSlotChange={setTimeSlot}
          onFormDataChange={setHasFormData}
          onClearDate={() => setSelectedIso(null)}
        />
      </div>
    </div>
  );
}
