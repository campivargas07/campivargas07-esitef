import {
  getGoogleAccessToken,
  getGoogleServiceAccount,
} from "@/lib/google-service-account";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";

function getSheetId(): string | null {
  return process.env.GOOGLE_PURCHASES_SHEET_ID?.trim() || null;
}

function normalizeSheetRange(range: string, fallback: string): string {
  const trimmed = range.trim();
  if (!trimmed) return fallback;
  if (!trimmed.includes("!")) return `${trimmed}!A:I`;
  return trimmed;
}

function getSheetRange(): string {
  return normalizeSheetRange(
    process.env.GOOGLE_PURCHASES_SHEET_RANGE ?? "",
    "Compras!A:I"
  );
}

function getPresencialesSheetRange(): string {
  return normalizeSheetRange(
    process.env.GOOGLE_PRESENCIALES_SHEET_RANGE ?? "",
    "Presenciales!A:I"
  );
}

function sheetTabFromRange(range: string): string {
  const i = range.indexOf("!");
  return i === -1 ? range : range.slice(0, i);
}

const PRESENCIALES_HEADERS = [
  "Fecha",
  "Pedido",
  "Formación",
  "Importe",
  "Moneda",
  "Método",
  "Email",
  "Nombre",
  "Admin",
];

let presencialesTabEnsured = false;

type EnsureTabResult = { ok: boolean; error?: string; tabTitle?: string };

/** Create Presenciales tab + header row if missing (Sheets API does not auto-create tabs). */
export async function ensurePresencialesSheetTab(): Promise<EnsureTabResult> {
  if (presencialesTabEnsured) return { ok: true };

  const sheetId = getSheetId();
  if (!sheetId || !getGoogleServiceAccount()) {
    const msg = "GOOGLE_PURCHASES_SHEET_ID o GOOGLE_SERVICE_ACCOUNT_JSON no configurados";
    console.warn("[google-purchases-sheet]", msg);
    return { ok: false, error: msg };
  }

  const range = getPresencialesSheetRange();
  const tabTitle = sheetTabFromRange(range);
  try {
    const token = await getGoogleAccessToken(SHEETS_SCOPE);
    const metaRes = await fetch(`${SHEETS_API}/${encodeURIComponent(sheetId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!metaRes.ok) {
      const body = await metaRes.text();
      const msg = `metadata ${metaRes.status}: ${body}`;
      console.error("[google-purchases-sheet]", msg);
      return { ok: false, error: msg, tabTitle };
    }

    const meta = (await metaRes.json()) as {
      sheets?: Array<{ properties?: { title?: string; sheetId?: number } }>;
    };
    let sheet = meta.sheets?.find((s) => s.properties?.title === tabTitle);

    if (!sheet) {
      const batchRes = await fetch(
        `${SHEETS_API}/${encodeURIComponent(sheetId)}:batchUpdate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requests: [{ addSheet: { properties: { title: tabTitle } } }],
          }),
        }
      );
      const batchBody = await batchRes.text();
      if (!batchRes.ok) {
        const alreadyExists = /already exists|duplicate/i.test(batchBody);
        if (!alreadyExists) {
          const msg = `addSheet ${batchRes.status}: ${batchBody}`;
          console.error("[google-purchases-sheet]", msg);
          return { ok: false, error: msg, tabTitle };
        }
      } else {
        const batchJson = JSON.parse(batchBody) as {
          replies?: Array<{
            addSheet?: { properties?: { sheetId?: number; title?: string } };
          }>;
        };
        const added = batchJson.replies?.[0]?.addSheet?.properties;
        if (added?.sheetId) {
          sheet = { properties: added };
        }
      }

      if (!sheet) {
        const metaRes2 = await fetch(
          `${SHEETS_API}/${encodeURIComponent(sheetId)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!metaRes2.ok) {
          const msg = `metadata refresh ${metaRes2.status}`;
          return { ok: false, error: msg, tabTitle };
        }
        const meta2 = (await metaRes2.json()) as typeof meta;
        sheet = meta2.sheets?.find((s) => s.properties?.title === tabTitle);
      }
    }

    if (!sheet?.properties?.sheetId) {
      const msg = `tab "${tabTitle}" not found after addSheet`;
      console.error("[google-purchases-sheet]", msg);
      return { ok: false, error: msg, tabTitle };
    }

    const headerRes = await fetch(
      `${SHEETS_API}/${encodeURIComponent(sheetId)}:batchUpdate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: [
            {
              updateCells: {
                range: {
                  sheetId: sheet.properties.sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: PRESENCIALES_HEADERS.length,
                },
                rows: [
                  {
                    values: PRESENCIALES_HEADERS.map((h) => ({
                      userEnteredValue: { stringValue: h },
                    })),
                  },
                ],
                fields: "userEnteredValue",
              },
            },
          ],
        }),
      }
    );
    if (!headerRes.ok) {
      console.warn(
        "[google-purchases-sheet] headers",
        headerRes.status,
        await headerRes.text()
      );
    }

    presencialesTabEnsured = true;
    return { ok: true, tabTitle };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[google-purchases-sheet] ensurePresencialesSheetTab", err);
    return { ok: false, error: msg, tabTitle };
  }
}

export function isGooglePurchasesSheetConfigured(): boolean {
  return Boolean(getSheetId() && getGoogleServiceAccount());
}

/** Append one purchase row. Returns false when skipped or on API error. */
export async function appendPurchaseRow(
  values: string[],
  range?: string
): Promise<boolean> {
  const sheetId = getSheetId();
  if (!sheetId || !getGoogleServiceAccount()) {
    console.warn("[google-purchases-sheet] not configured, skipping");
    return false;
  }

  try {
    const token = await getGoogleAccessToken(SHEETS_SCOPE);
    const targetRange = range ?? getSheetRange();
    const url = `${SHEETS_API}/${encodeURIComponent(sheetId)}/values/${encodeURIComponent(targetRange)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [values] }),
    });

    if (!res.ok) {
      console.error(
        "[google-purchases-sheet] append",
        res.status,
        await res.text()
      );
      return false;
    }

    return true;
  } catch (err) {
    console.error("[google-purchases-sheet]", err);
    return false;
  }
}

/** Append one presencial inscription row to the Presenciales tab. */
export async function appendPresencialRow(values: string[]): Promise<boolean> {
  const range = getPresencialesSheetRange();
  let ok = await appendPurchaseRow(values, range);
  if (ok) return true;

  const ensured = await ensurePresencialesSheetTab();
  if (!ensured.ok) {
    console.error(
      "[google-purchases-sheet] presencial append aborted:",
      ensured.error
    );
    return false;
  }

  ok = await appendPurchaseRow(values, range);
  if (!ok) {
    console.error(
      "[google-purchases-sheet] presencial append failed after ensure",
      range
    );
  }
  return ok;
}
