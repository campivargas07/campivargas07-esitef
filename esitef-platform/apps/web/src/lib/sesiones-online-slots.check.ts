/**
 * ponytail: assert-based self-check for slot math.
 * Run: npx tsx src/lib/sesiones-online-slots.check.ts
 */
import {
  filterOpenSlots,
  generateCandidateSlotsForDate,
  openSlotsToTimeLabels,
  slotToInterval,
  toISODate,
} from "./sesiones-online-slots";

const date = "2026-07-16";
const slots = generateCandidateSlotsForDate(date);
console.assert(slots.length === 3, "expected 3 candidate slots");

const labels = openSlotsToTimeLabels(slots);
console.assert(labels.includes("10:00"), "missing 10:00 slot");

const { start, end } = slotToInterval(date, "10:00");
console.assert(end.getTime() - start.getTime() === 75 * 60_000, "75 min duration");

const blocked = filterOpenSlots(slots, [{ start, end }], []);
console.assert(blocked.length === 2, "busy interval should block one slot");

const past = generateCandidateSlotsForDate("2020-01-01");
console.assert(past.length === 0, "past date has no slots");

console.log("sesiones-online-slots.check: ok");
