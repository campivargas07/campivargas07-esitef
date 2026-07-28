import {
  getGoogleAccessToken,
  getGoogleServiceAccount,
} from "@/lib/google-service-account";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";

function getSheetId(): string | null {
  return process.env.GOOGLE_PURCHASES_SHEET_ID?.trim() || null;
}

function getSheetRange(): string {
  return process.env.GOOGLE_PURCHASES_SHEET_RANGE?.trim() || "Compras!A:I";
}

export function isGooglePurchasesSheetConfigured(): boolean {
  return Boolean(getSheetId() && getGoogleServiceAccount());
}

/** Append one purchase row. Returns false when skipped or on API error. */
export async function appendPurchaseRow(values: string[]): Promise<boolean> {
  const sheetId = getSheetId();
  if (!sheetId || !getGoogleServiceAccount()) {
    console.warn("[google-purchases-sheet] not configured, skipping");
    return false;
  }

  try {
    const token = await getGoogleAccessToken(SHEETS_SCOPE);
    const range = getSheetRange();
    const url = `${SHEETS_API}/${encodeURIComponent(sheetId)}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

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
