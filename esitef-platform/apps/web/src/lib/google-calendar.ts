import { createSign } from "crypto";
import type { TimeInterval } from "@/lib/sesiones-online-slots";
import { SESSION_TIMEZONE } from "@/lib/sesiones-online-slots";

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API_BASE = "https://www.googleapis.com/calendar/v3";

type ServiceAccountCreds = {
  client_email: string;
  private_key: string;
};

let tokenCache: { token: string; expiresAt: number } | null = null;
const freeBusyCache = new Map<string, { at: number; busy: TimeInterval[] }>();
const CACHE_MS = 3 * 60_000;

function getCalendarId(): string | null {
  return process.env.GOOGLE_CALENDAR_ID?.trim() || null;
}

function getServiceAccount(): ServiceAccountCreds | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ServiceAccountCreds;
  } catch {
    return null;
  }
}

export function isGoogleCalendarConfigured(): boolean {
  return Boolean(getCalendarId() && getServiceAccount());
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function getAccessToken(): Promise<string> {
  const creds = getServiceAccount();
  if (!creds) throw new Error("Google Calendar no configurado");

  const now = Math.floor(Date.now() / 1000);
  if (tokenCache && tokenCache.expiresAt > now + 60) {
    return tokenCache.token;
  }

  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iss: creds.client_email,
      scope: CALENDAR_SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${payload}`;
  const sign = createSign("RSA-SHA256");
  sign.update(unsigned);
  sign.end();
  const signature = sign.sign(creds.private_key.replace(/\\n/g, "\n"));
  const jwt = `${unsigned}.${base64url(signature)}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    throw new Error(`Google token error: ${res.status}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = {
    token: data.access_token,
    expiresAt: now + data.expires_in,
  };
  return data.access_token;
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

  const token = await getAccessToken();
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

  const token = await getAccessToken();
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
