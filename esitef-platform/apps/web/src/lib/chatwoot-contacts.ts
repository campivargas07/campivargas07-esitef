type ChatwootContactInput = {
  name?: string | null;
  email: string;
  phone?: string | null;
};

type ChatwootSearchPayload = {
  payload?: Array<{ id: number; email?: string | null }>;
};

function getBaseUrl(): string | null {
  return (
    process.env.CHATWOOT_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL?.trim() ||
    null
  );
}

function getApiToken(): string | null {
  return process.env.CHATWOOT_API_TOKEN?.trim() || null;
}

function getAccountId(): string | null {
  return process.env.CHATWOOT_ACCOUNT_ID?.trim() || null;
}

export function isChatwootConfigured(): boolean {
  return Boolean(getBaseUrl() && getApiToken() && getAccountId());
}

async function chatwootRequest(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const baseUrl = getBaseUrl()!.replace(/\/$/, "");
  const token = getApiToken()!;
  return fetch(`${baseUrl}/api/v1${path}`, {
    ...options,
    headers: {
      api_access_token: token,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

function buildContactBody(input: ChatwootContactInput, email: string) {
  const body: Record<string, string> = {
    name: input.name?.trim() || email,
    email,
  };
  const phone = input.phone?.trim();
  if (phone) body.phone_number = phone;
  return body;
}

/** Upsert contact by email. Returns false when skipped or on API error. */
export async function upsertChatwootContact(
  input: ChatwootContactInput
): Promise<boolean> {
  if (!isChatwootConfigured()) {
    console.warn("[chatwoot-contacts] not configured, skipping");
    return false;
  }

  const email = input.email.trim().toLowerCase();
  if (!email) return false;

  const accountId = getAccountId()!;

  try {
    const searchRes = await chatwootRequest(
      `/accounts/${accountId}/contacts/search?q=${encodeURIComponent(email)}`
    );
    if (!searchRes.ok) {
      console.error(
        "[chatwoot-contacts] search",
        searchRes.status,
        await searchRes.text()
      );
      return false;
    }

    const searchData = (await searchRes.json()) as ChatwootSearchPayload;
    const existing =
      searchData.payload?.find(
        (c) => c.email?.trim().toLowerCase() === email
      ) ?? searchData.payload?.[0];

    const body = buildContactBody(input, email);

    if (existing?.id) {
      const updateRes = await chatwootRequest(
        `/accounts/${accountId}/contacts/${existing.id}`,
        { method: "PUT", body: JSON.stringify(body) }
      );
      if (!updateRes.ok) {
        console.error(
          "[chatwoot-contacts] update",
          updateRes.status,
          await updateRes.text()
        );
        return false;
      }
      return true;
    }

    const createRes = await chatwootRequest(
      `/accounts/${accountId}/contacts`,
      { method: "POST", body: JSON.stringify(body) }
    );
    if (!createRes.ok) {
      console.error(
        "[chatwoot-contacts] create",
        createRes.status,
        await createRes.text()
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error("[chatwoot-contacts]", err);
    return false;
  }
}
