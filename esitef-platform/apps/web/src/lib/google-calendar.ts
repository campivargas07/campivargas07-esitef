import type { TimeInterval } from "@/lib/sesiones-online-slots";
import { SESSION_TIMEZONE } from "@/lib/sesiones-online-slots";
import {
  getGoogleAccessToken,
  getGoogleServiceAccount,
} from "@/lib/google-service-account";

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";
const API_BASE = "https://www.googleapis.com/calendar/v3";

const freeBusyCache = new Map<string, { at: number; busy: TimeInterval[] }>();
const CACHE_MS = 3 * 60_000;

function getCalendarId(): string | null {
  return process.env.GOOGLE_CALENDAR_ID?.trim() || null;
}

export function isGoogleCalendarConfigured(): boolean {
  return Boolean(getCalendarId() && getGoogleServiceAccount());
}

function parseGoogleDateTime(value: string): Date {
  if (value.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(value)) {
    return new Date(value);
  }
  return new Date(`${value}+00:00`);
}

export async function getBusyIntervals(
  rangeStart: Date,
  rangeEnd: Date,
): Promise<TimeInterval[]> {
  if (!isGoogleCalendarConfigured()) return [];

  const cacheKey = `${rangeStart.toISOString()}_${rangeEnd.toISOString()}`;
  const hit = freeBusyCache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.busy;

  const token = await getGoogleAccessToken(CALENDAR_SCOPE);
  const calendarId = getCalendarId()!;

  const res = await fetch(`${API_BASE}/freeBusy`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin: rangeStart.toISOString(),
      timeMax: rangeEnd.toISOString(),
      timeZone: SESSION_TIMEZONE,
      items: [{ id: calendarId }],
    }),
  });

  if (!res.ok) {
    console.error("[google-calendar] freeBusy", res.status, await res.text());
    return [];
  }

  const data = (await res.json()) as {
    calendars?: Record<string, { busy?: Array<{ start: string; end: string }> }>;
  };
  const busyRaw = data.calendars?.[calendarId]?.busy ?? [];
  const busy = busyRaw.map((b) => ({
    start: parseGoogleDateTime(b.start),
    end: parseGoogleDateTime(b.end),
  }));

  freeBusyCache.set(cacheKey, { at: Date.now(), busy });
  return busy;
}

export type CalendarEventInput = {
  title: string;
  description: string;
  startsAt: Date;
  endsAt: Date;
  attendeeEmail: string;
};

export async function createCalendarEvent(
  input: CalendarEventInput,
): Promise<string | null> {
  if (!isGoogleCalendarConfigured()) return null;

  const token = await getGoogleAccessToken(CALENDAR_SCOPE);
  const calendarId = getCalendarId()!;

  const res = await fetch(
    `${API_BASE}/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=all`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: input.title,
        description: input.description,
        start: {
          dateTime: input.startsAt.toISOString(),
          timeZone: SESSION_TIMEZONE,
        },
        end: {
          dateTime: input.endsAt.toISOString(),
          timeZone: SESSION_TIMEZONE,
        },
        attendees: [{ email: input.attendeeEmail }],
      }),
    },
  );

  if (!res.ok) {
    console.error("[google-calendar] events.insert", res.status, await res.text());
    return null;
  }

  const data = (await res.json()) as { id?: string };
  return data.id ?? null;
}
