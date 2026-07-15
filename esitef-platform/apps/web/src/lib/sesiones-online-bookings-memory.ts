import {
  SESSION_HOLD_TTL_MS,
  slotToInterval,
  type TimeInterval,
} from "@/lib/sesiones-online-slots";
import type { SesionOnlineBooking } from "@/lib/sesiones-online-bookings";

type MemRow = SesionOnlineBooking & { expiresAt: Date | null };

const rows = new Map<string, MemRow>();

function isActive(row: MemRow): boolean {
  if (row.status === "confirmed") return true;
  if (row.status !== "pending") return false;
  return row.expiresAt !== null && row.expiresAt > new Date();
}

function expireStale(): void {
  const now = new Date();
  for (const row of rows.values()) {
    if (
      row.status === "pending" &&
      row.expiresAt &&
      row.expiresAt <= now
    ) {
      row.status = "cancelled";
    }
  }
}

export function memGetBookedIntervalsForRange(
  rangeStart: Date,
  rangeEnd: Date,
): TimeInterval[] {
  expireStale();
  return [...rows.values()]
    .filter(isActive)
    .filter((r) => r.startsAt < rangeEnd && r.endsAt > rangeStart)
    .map((r) => ({ start: r.startsAt, end: r.endsAt }));
}

export function memHold(booking: {
  orderId: string;
  date: string;
  timeSlot: string;
  name: string;
  email: string;
  phone?: string;
  startsAt: Date;
  endsAt: Date;
}): boolean {
  expireStale();
  const clash = [...rows.values()].some(
    (r) =>
      isActive(r) &&
      r.startsAt.getTime() === booking.startsAt.getTime(),
  );
  if (clash) return false;

  rows.set(booking.orderId, {
    orderId: booking.orderId,
    date: booking.date,
    timeSlot: booking.timeSlot,
    name: booking.name,
    email: booking.email,
    phone: booking.phone,
    status: "pending",
    startsAt: booking.startsAt,
    endsAt: booking.endsAt,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + SESSION_HOLD_TTL_MS),
  });
  return true;
}

export function memConfirm(
  orderId: string,
  googleEventId?: string | null,
): SesionOnlineBooking | null {
  const row = rows.get(orderId);
  if (!row) return null;
  row.status = "confirmed";
  row.expiresAt = null;
  if (googleEventId) row.googleEventId = googleEventId;
  return { ...row };
}

export function memRelease(orderId: string): void {
  const row = rows.get(orderId);
  if (row?.status === "pending") row.status = "cancelled";
}

export function memGetByOrderId(orderId: string): SesionOnlineBooking | null {
  const row = rows.get(orderId);
  return row ? { ...row } : null;
}

export function memGetTakenSlotsForDate(date: string): string[] {
  const start = slotToInterval(date, "10:00").start;
  const end = slotToInterval(date, "23:59").end;
  return memGetBookedIntervalsForRange(start, end).map((b) => {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Madrid",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(b.start);
    const h = parts.find((p) => p.type === "hour")?.value ?? "00";
    const m = parts.find((p) => p.type === "minute")?.value ?? "00";
    return `${h}:${m}`;
  });
}
