import { getBusyIntervals, isGoogleCalendarConfigured } from "@/lib/google-calendar";
import {
  datesInMonth,
  filterOpenSlots,
  generateCandidateSlotsForDate,
  getDemoAvailableDates,
  openSlotsToTimeLabels,
  slotToInterval,
} from "@/lib/sesiones-online-slots";
import { getBookedIntervalsForRange } from "@/lib/sesiones-online-bookings";

export async function getOpenSlotsForDate(dateIso: string): Promise<string[]> {
  const candidates = generateCandidateSlotsForDate(dateIso);
  if (!candidates.length) return [];

  const rangeStart = candidates[0].start;
  const rangeEnd = candidates[candidates.length - 1].end;

  const [busy, booked] = await Promise.all([
    getBusyIntervals(rangeStart, rangeEnd),
    getBookedIntervalsForRange(rangeStart, rangeEnd),
  ]);

  const open = filterOpenSlots(candidates, busy, booked);
  return openSlotsToTimeLabels(open);
}

export async function getAvailableDatesForMonth(
  year: number,
  month: number,
): Promise<string[]> {
  if (!isGoogleCalendarConfigured()) {
    const demo = new Set(getDemoAvailableDates());
    return datesInMonth(year, month).filter((d) => demo.has(d));
  }

  const days = datesInMonth(year, month);
  if (!days.length) return [];

  const rangeStart = slotToInterval(days[0], "10:00").start;
  const last = days[days.length - 1];
  const rangeEnd = slotToInterval(last, "16:00").end;

  const [busy, booked] = await Promise.all([
    getBusyIntervals(rangeStart, rangeEnd),
    getBookedIntervalsForRange(rangeStart, rangeEnd),
  ]);

  const available: string[] = [];
  for (const dateIso of days) {
    const candidates = generateCandidateSlotsForDate(dateIso);
    const open = filterOpenSlots(candidates, busy, booked);
    if (open.length > 0) available.push(dateIso);
  }
  return available;
}

export async function isDateBookable(dateIso: string): Promise<boolean> {
  const slots = await getOpenSlotsForDate(dateIso);
  return slots.length > 0;
}
