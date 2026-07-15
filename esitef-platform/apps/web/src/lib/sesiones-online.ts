import {
  formatOnlineMoney,
  resolveOnlinePrice,
  type OnlineCurrency,
} from "@/lib/online-currency";
import { SESSION_COURSE_SLUG } from "@/lib/sesiones-online-slots";

export {
  SESSION_COURSE_SLUG,
  SESSION_TIME_SLOTS,
  SESSION_CANDIDATE_SLOTS,
  formatSessionDateLabel,
  formatTimeSlotLabel,
  sessionSlotKey,
  slotToInterval,
  toISODate,
  type SessionTimeSlot,
} from "@/lib/sesiones-online-slots";

export function getSesionOnlinePrice(preferred?: OnlineCurrency) {
  const currency = preferred ?? "USD";
  return resolveOnlinePrice({
    courseSlug: SESSION_COURSE_SLUG,
    preferred: currency,
    fallbackCents: 9000,
    fallbackCurrency: "USD",
  });
}

export function formatSessionPrice(
  currency: OnlineCurrency,
  amountMinor: number,
): string {
  return formatOnlineMoney(amountMinor, currency);
}
