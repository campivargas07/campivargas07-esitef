import { sessionSlotKey } from "@/lib/sesiones-online";

export type SesionOnlineBookingStatus = "pending" | "confirmed";

export type SesionOnlineBooking = {
  orderId: string;
  date: string;
  timeSlot: string;
  name: string;
  email: string;
  phone?: string;
  status: SesionOnlineBookingStatus;
  createdAt: number;
};

// ponytail: almacén en memoria del proceso — no persiste reinicios ni multi-instancia; migrar a DB.
const bookingsBySlot = new Map<string, SesionOnlineBooking>();
const bookingsByOrderId = new Map<string, SesionOnlineBooking>();

function isActive(booking: SesionOnlineBooking): boolean {
  return booking.status === "pending" || booking.status === "confirmed";
}

export function getTakenSlotsForDate(date: string): string[] {
  return [...bookingsBySlot.values()]
    .filter((b) => b.date === date && isActive(b))
    .map((b) => b.timeSlot);
}

export function holdSesionOnlineSlot(
  booking: Omit<SesionOnlineBooking, "status" | "createdAt">
): boolean {
  const key = sessionSlotKey(booking.date, booking.timeSlot);
  const existing = bookingsBySlot.get(key);
  if (existing && isActive(existing)) return false;

  const record: SesionOnlineBooking = {
    ...booking,
    status: "pending",
    createdAt: Date.now(),
  };
  bookingsBySlot.set(key, record);
  bookingsByOrderId.set(booking.orderId, record);
  return true;
}

export function confirmSesionOnlineBooking(orderId: string): SesionOnlineBooking | null {
  const booking = bookingsByOrderId.get(orderId);
  if (!booking) return null;
  const confirmed = { ...booking, status: "confirmed" as const };
  bookingsByOrderId.set(orderId, confirmed);
  bookingsBySlot.set(sessionSlotKey(booking.date, booking.timeSlot), confirmed);
  return confirmed;
}

export function releaseSesionOnlineSlot(orderId: string): void {
  const booking = bookingsByOrderId.get(orderId);
  if (!booking || booking.status !== "pending") return;
  bookingsByOrderId.delete(orderId);
  bookingsBySlot.delete(sessionSlotKey(booking.date, booking.timeSlot));
}

export function getSesionOnlineBookingByOrderId(
  orderId: string
): SesionOnlineBooking | null {
  return bookingsByOrderId.get(orderId) ?? null;
}
