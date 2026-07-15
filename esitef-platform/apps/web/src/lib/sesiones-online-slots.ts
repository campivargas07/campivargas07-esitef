/** Sesión online con Tomás — slots, TZ Madrid, duración. */
export const SESSION_COURSE_SLUG = "sesiones-online-tomas";
export const SESSION_TIMEZONE = "Europe/Madrid";
export const SESSION_DURATION_MINUTES = 75;
export const SESSION_HOLD_TTL_MS = 15 * 60 * 1000;

/** Horarios candidatos (hora local Madrid). */
export const SESSION_CANDIDATE_SLOTS = ["10:00", "12:00", "16:00"] as const;

export type SessionTimeSlot = (typeof SESSION_CANDIDATE_SLOTS)[number];

export const SESSION_TIME_SLOTS = SESSION_CANDIDATE_SLOTS;

export type TimeInterval = { start: Date; end: Date };

/** ISO local date YYYY-MM-DD (no timezone drift). */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatSessionDateLabel(iso: string): string {
  const { start } = slotToInterval(iso, "12:00");
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: SESSION_TIMEZONE,
  }).format(start);
}

export function formatTimeSlotLabel(slot: string): string {
  return `${slot} h (hora de Madrid)`;
}

export function sessionSlotKey(date: string, timeSlot: string): string {
  return `${date}:${timeSlot}`;
}

type MadridParts = {
  dateIso: string;
  hour: number;
  minute: number;
};

function madridPartsFromDate(date: Date): MadridParts {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: SESSION_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");
  const year = get("year");
  const month = String(get("month")).padStart(2, "0");
  const day = String(get("day")).padStart(2, "0");
  return {
    dateIso: `${year}-${month}-${day}`,
    hour: get("hour") % 24,
    minute: get("minute"),
  };
}

/** Convierte fecha + HH:mm (Madrid) a intervalo UTC. */
export function slotToInterval(
  dateIso: string,
  timeSlot: string,
): TimeInterval {
  const [hour, minute] = timeSlot.split(":").map(Number);
  const [y, m, d] = dateIso.split("-").map(Number);
  let lo = Date.UTC(y, m - 1, d, 0, 0) - 4 * 3_600_000;
  let hi = Date.UTC(y, m - 1, d, 23, 59) + 4 * 3_600_000;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const local = madridPartsFromDate(new Date(mid));
    const cmp =
      local.dateIso.localeCompare(dateIso) ||
      local.hour - hour ||
      local.minute - minute;
    if (cmp < 0) lo = mid + 1;
    else hi = mid;
  }

  const startsAt = new Date(lo);
  const endsAt = new Date(
    startsAt.getTime() + SESSION_DURATION_MINUTES * 60_000,
  );
  return { start: startsAt, end: endsAt };
}

export function generateCandidateSlotsForDate(dateIso: string): TimeInterval[] {
  const todayIso = toISODate(new Date());
  if (dateIso < todayIso) return [];

  return SESSION_CANDIDATE_SLOTS.map((slot) => slotToInterval(dateIso, slot));
}

export function intervalOverlaps(
  a: TimeInterval,
  b: TimeInterval,
): boolean {
  return a.start < b.end && b.start < a.end;
}

export function filterOpenSlots(
  candidates: TimeInterval[],
  busy: TimeInterval[],
  booked: TimeInterval[],
): TimeInterval[] {
  const blocks = [...busy, ...booked];
  return candidates.filter(
    (slot) => !blocks.some((b) => intervalOverlaps(slot, b)),
  );
}

export function openSlotsToTimeLabels(slots: TimeInterval[]): string[] {
  return slots.map((slot) => {
    const local = madridPartsFromDate(slot.start);
    return `${String(local.hour).padStart(2, "0")}:${String(local.minute).padStart(2, "0")}`;
  });
}

export function datesInMonth(year: number, month: number): string[] {
  const days = new Date(year, month + 1, 0).getDate();
  const dates: string[] = [];
  for (let d = 1; d <= days; d++) {
    dates.push(toISODate(new Date(year, month, d, 12)));
  }
  return dates;
}

/** ponytail: sin Google Calendar, martes/jueves próximas 8 semanas. */
export function getDemoAvailableDates(): string[] {
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
