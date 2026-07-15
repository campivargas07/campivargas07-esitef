import { and, eq, gt, lt, or } from "drizzle-orm";
import { sesionOnlineBookings } from "@esitef/db";
import { getDb } from "@/lib/db";
import * as mem from "@/lib/sesiones-online-bookings-memory";
import { isSesionesOnlineSimulation } from "@/lib/sesiones-online-simulation";
import {
  SESSION_HOLD_TTL_MS,
  slotToInterval,
  type TimeInterval,
} from "@/lib/sesiones-online-slots";

export type SesionOnlineBookingStatus = "pending" | "confirmed" | "cancelled";

export type SesionOnlineBooking = {
  orderId: string;
  date: string;
  timeSlot: string;
  name: string;
  email: string;
  phone?: string;
  status: SesionOnlineBookingStatus;
  startsAt: Date;
  endsAt: Date;
  googleEventId?: string | null;
  createdAt: Date;
};

function madridDateIso(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function rowToBooking(row: typeof sesionOnlineBookings.$inferSelect): SesionOnlineBooking {
  return {
    orderId: row.orderId,
    date: madridDateIso(row.startsAt),
    timeSlot: row.timeSlot,
    name: row.customerName,
    email: row.customerEmail,
    phone: row.customerPhone ?? undefined,
    status: row.status,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    googleEventId: row.googleEventId,
    createdAt: row.createdAt,
  };
}

export async function expireStalePendingBookings(): Promise<void> {
  if (isSesionesOnlineSimulation()) return;
  const db = getDb();
  const now = new Date();
  await db
    .update(sesionOnlineBookings)
    .set({ status: "cancelled" })
    .where(
      and(
        eq(sesionOnlineBookings.status, "pending"),
        lt(sesionOnlineBookings.expiresAt, now),
      ),
    );
}

function activeBookingCondition() {
  const now = new Date();
  return or(
    eq(sesionOnlineBookings.status, "confirmed"),
    and(
      eq(sesionOnlineBookings.status, "pending"),
      gt(sesionOnlineBookings.expiresAt, now),
    ),
  );
}

export async function getBookedIntervalsForRange(
  rangeStart: Date,
  rangeEnd: Date,
): Promise<TimeInterval[]> {
  if (isSesionesOnlineSimulation()) {
    return mem.memGetBookedIntervalsForRange(rangeStart, rangeEnd);
  }

  await expireStalePendingBookings();
  const db = getDb();
  const rows = await db
    .select()
    .from(sesionOnlineBookings)
    .where(
      and(
        activeBookingCondition(),
        lt(sesionOnlineBookings.startsAt, rangeEnd),
        gt(sesionOnlineBookings.endsAt, rangeStart),
      ),
    );

  return rows.map((r) => ({ start: r.startsAt, end: r.endsAt }));
}

export async function getTakenSlotsForDate(date: string): Promise<string[]> {
  if (isSesionesOnlineSimulation()) {
    return mem.memGetTakenSlotsForDate(date);
  }

  const start = slotToInterval(date, "10:00").start;
  const end = slotToInterval(date, "23:59").end;
  const booked = await getBookedIntervalsForRange(start, end);
  return booked.map((b) => {
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

export async function holdSesionOnlineSlot(booking: {
  orderId: string;
  date: string;
  timeSlot: string;
  name: string;
  email: string;
  phone?: string;
  startsAt: Date;
  endsAt: Date;
}): Promise<boolean> {
  if (isSesionesOnlineSimulation()) {
    return mem.memHold(booking);
  }

  await expireStalePendingBookings();
  const db = getDb();
  const expiresAt = new Date(Date.now() + SESSION_HOLD_TTL_MS);

  try {
    await db.insert(sesionOnlineBookings).values({
      orderId: booking.orderId,
      startsAt: booking.startsAt,
      endsAt: booking.endsAt,
      timeSlot: booking.timeSlot,
      customerName: booking.name,
      customerEmail: booking.email,
      customerPhone: booking.phone,
      status: "pending",
      expiresAt,
    });
    return true;
  } catch {
    return false;
  }
}

export async function confirmSesionOnlineBooking(
  orderId: string,
  googleEventId?: string | null,
): Promise<SesionOnlineBooking | null> {
  if (isSesionesOnlineSimulation()) {
    return mem.memConfirm(orderId, googleEventId);
  }

  const db = getDb();
  const [row] = await db
    .update(sesionOnlineBookings)
    .set({
      status: "confirmed",
      expiresAt: null,
      ...(googleEventId ? { googleEventId } : {}),
    })
    .where(eq(sesionOnlineBookings.orderId, orderId))
    .returning();

  return row ? rowToBooking(row) : null;
}

export async function releaseSesionOnlineSlot(orderId: string): Promise<void> {
  if (isSesionesOnlineSimulation()) {
    mem.memRelease(orderId);
    return;
  }

  const db = getDb();
  await db
    .update(sesionOnlineBookings)
    .set({ status: "cancelled" })
    .where(
      and(
        eq(sesionOnlineBookings.orderId, orderId),
        eq(sesionOnlineBookings.status, "pending"),
      ),
    );
}

export async function getSesionOnlineBookingByOrderId(
  orderId: string,
): Promise<SesionOnlineBooking | null> {
  if (isSesionesOnlineSimulation()) {
    return mem.memGetByOrderId(orderId);
  }

  const db = getDb();
  const [row] = await db
    .select()
    .from(sesionOnlineBookings)
    .where(eq(sesionOnlineBookings.orderId, orderId))
    .limit(1);
  return row ? rowToBooking(row) : null;
}

export async function setSesionOnlineGoogleEventId(
  orderId: string,
  googleEventId: string,
): Promise<void> {
  if (isSesionesOnlineSimulation()) return;

  const db = getDb();
  await db
    .update(sesionOnlineBookings)
    .set({ googleEventId })
    .where(eq(sesionOnlineBookings.orderId, orderId));
}
