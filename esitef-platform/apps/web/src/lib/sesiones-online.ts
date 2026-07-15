/** ISO local date YYYY-MM-DD (no timezone drift). */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** ponytail: fechas demo — martes y jueves próximos 8 semanas; sustituir por API/DB. */
export function getAvailableSessionDates(): string[] {
  const dates: string[] = [];
  const start = new Date();
  start.setHours(12, 0, 0, 0);

  for (let i = 1; i <= 56; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const dow = day.getDay();
    if (dow === 2 || dow === 4) {
      dates.push(toISODate(day));
    }
  }

  return dates;
}

export function formatSessionDateLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d, 12);
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** ponytail: horarios fijos; sustituir por disponibilidad real del profesorado. */
export const SESSION_TIME_SLOTS = ["10:00", "12:00", "16:00"] as const;

export type SessionTimeSlot = (typeof SESSION_TIME_SLOTS)[number];

/** ponytail: precio demo — 45 EUR por sesión individual. */
export const SESSION_PRICE_CENTS = 4500;
export const SESSION_CURRENCY = "EUR";

export function formatTimeSlotLabel(slot: string): string {
  return `${slot} h (hora de Madrid)`;
}

export function formatSessionPrice(): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: SESSION_CURRENCY,
  }).format(SESSION_PRICE_CENTS / 100);
}

export function sessionSlotKey(date: string, timeSlot: string): string {
  return `${date}:${timeSlot}`;
}
