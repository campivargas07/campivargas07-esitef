"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import {
  formatSessionDateLabel,
  formatSessionPrice,
  formatTimeSlotLabel,
  SESSION_TIME_SLOTS,
  type SessionTimeSlot,
} from "@/lib/sesiones-online";
import { readJsonResponse } from "@/lib/read-json-response";

type Props = {
  dateIso: string | null;
  timeSlot: SessionTimeSlot | null;
  onTimeSlotChange: (slot: SessionTimeSlot | null) => void;
  onFormDataChange: (hasData: boolean) => void;
  onClearDate: () => void;
};

export function SesionesOnlineBookingPanel({
  dateIso,
  timeSlot,
  onTimeSlotChange,
  onFormDataChange,
  onClearDate,
}: Props) {
  const panelId = useId();
  const titleId = `${panelId}-title`;
  const panelRef = useRef<HTMLElement>(null);
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dateIso) {
      setTakenSlots([]);
      setLoadingSlots(false);
      return;
    }

    let cancelled = false;
    setLoadingSlots(true);
    onTimeSlotChange(null);

    fetch(
      `/api/sesiones-online/disponibilidad?fecha=${encodeURIComponent(dateIso)}`,
    )
      .then((res) => res.json())
      .then((data: { takenSlots?: string[] }) => {
        if (!cancelled) setTakenSlots(data.takenSlots ?? []);
      })
      .catch(() => {
        if (!cancelled) setTakenSlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dateIso, onTimeSlotChange]);

  useEffect(() => {
    if (!dateIso) return;
    const slotsRegion = panelRef.current?.querySelector(
      ".sesiones-online-booking__slot-grid",
    );
    const firstSlot = slotsRegion?.querySelector<HTMLElement>(
      "button:not(:disabled)",
    );
    firstSlot?.focus({ preventScroll: true });
  }, [dateIso, loadingSlots]);

  function onFormInput() {
    const form = panelRef.current?.querySelector("form");
    if (!form) return;
    const name = (form.elements.namedItem("name") as HTMLInputElement)?.value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value.trim();
    onFormDataChange(Boolean(name && email));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!dateIso) return;
    if (!timeSlot) {
      setError("Elige un horario para continuar.");
      return;
    }

    setStatus("loading");
    setError(null);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/checkout/sesiones-online", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: dateIso,
        timeSlot,
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone") || undefined,
      }),
    });

    const data = await readJsonResponse<{ url?: string }>(res);
    if (!res.ok || !data.url) {
      setStatus("error");
      setError(data.error ?? data.message ?? "No se pudo iniciar el pago.");
      return;
    }

    window.location.href = data.url;
  }

  const openSlots = dateIso
    ? SESSION_TIME_SLOTS.filter((slot) => !takenSlots.includes(slot))
    : [];

  if (!dateIso) {
    return (
      <section
        ref={panelRef}
        className="sesiones-online-booking sesiones-online-booking--empty"
        aria-labelledby={titleId}
      >
        <h3 id={titleId} className="sesiones-online-booking__title">
          Tu reserva
        </h3>
        <div className="sesiones-online-booking__empty">
          <span className="sesiones-online-booking__empty-icon" aria-hidden>
            1
          </span>
          <p className="sesiones-online-booking__empty-text">
            Elige una fecha disponible en el calendario para ver horarios y
            completar tu reserva.
          </p>
        </div>
      </section>
    );
  }

  const dateLabel = formatSessionDateLabel(dateIso);

  return (
    <section
      ref={panelRef}
      className="sesiones-online-booking"
      role="region"
      aria-labelledby={titleId}
    >
      <div className="sesiones-online-booking__header">
        <h3 id={titleId} className="sesiones-online-booking__title">
          Tu reserva
        </h3>
        <p className="sesiones-online-booking__price">
          {formatSessionPrice()}
          <span className="sesiones-online-booking__price-note">
            pago único
          </span>
        </p>
      </div>

      <p className="sesiones-online-booking__summary">
        <span className="sesiones-online-booking__summary-label">Sesión</span>
        <strong>{dateLabel}</strong>
      </p>

      <form
        className="sesiones-online-booking__form"
        onSubmit={onSubmit}
        onInput={onFormInput}
        noValidate
      >
        <fieldset className="sesiones-online-booking__slots">
          <legend>Horario</legend>
          {loadingSlots ? (
            <p className="sesiones-online-booking__hint" role="status">
              Cargando horarios…
            </p>
          ) : openSlots.length === 0 ? (
            <p className="sesiones-online-booking__hint" role="status">
              No quedan horarios libres este día.{" "}
              <button
                type="button"
                className="sesiones-online-booking__link"
                onClick={onClearDate}
              >
                Elige otra fecha
              </button>
            </p>
          ) : (
            <div
              className="sesiones-online-booking__slot-grid"
              role="group"
              aria-label="Horarios disponibles"
            >
              {SESSION_TIME_SLOTS.map((slot) => {
                const taken = takenSlots.includes(slot);
                const selected = timeSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    className={[
                      "sesiones-online-booking__slot",
                      selected && "sesiones-online-booking__slot--selected",
                      taken && "sesiones-online-booking__slot--taken",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    disabled={taken}
                    aria-pressed={selected}
                    onClick={() => onTimeSlotChange(slot)}
                  >
                    {formatTimeSlotLabel(slot)}
                    {taken && (
                      <span className="sesiones-online-booking__slot-tag">
                        Ocupado
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </fieldset>

        <div
          className={[
            "sesiones-online-booking__details",
            timeSlot && "sesiones-online-booking__details--visible",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden={!timeSlot}
        >
          <p className="sesiones-online-booking__details-heading">Tus datos</p>

          <div className="sesiones-online-booking__field">
            <label htmlFor={`${panelId}-name`}>
              Nombre <span aria-hidden="true">*</span>
            </label>
            <input
              id={`${panelId}-name`}
              name="name"
              type="text"
              autoComplete="name"
              required
              maxLength={120}
              tabIndex={timeSlot ? 0 : -1}
            />
          </div>

          <div className="sesiones-online-booking__field">
            <label htmlFor={`${panelId}-email`}>
              Email <span aria-hidden="true">*</span>
            </label>
            <input
              id={`${panelId}-email`}
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              tabIndex={timeSlot ? 0 : -1}
            />
          </div>

          <div className="sesiones-online-booking__field">
            <label htmlFor={`${panelId}-phone`}>Teléfono (opcional)</label>
            <input
              id={`${panelId}-phone`}
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={40}
              tabIndex={timeSlot ? 0 : -1}
            />
          </div>
        </div>

        {error && (
          <p className="sesiones-online-booking__error" role="alert">
            {error}
          </p>
        )}

        <div className="sesiones-online-booking__actions">
          <button
            type="submit"
            className="sesiones-online-booking__submit"
            disabled={
              status === "loading" ||
              loadingSlots ||
              openSlots.length === 0 ||
              !timeSlot
            }
          >
            {status === "loading" ? "Redirigiendo al pago…" : "Continuar al pago"}
          </button>
        </div>
      </form>
    </section>
  );
}
