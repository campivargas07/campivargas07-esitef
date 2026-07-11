export async function readJsonResponse<T extends Record<string, unknown>>(
  res: Response
): Promise<T & { message?: string; error?: string }> {
  const text = await res.text();
  if (!text) {
    const fallback = `Error del servidor (${res.status})`;
    return (res.ok
      ? {}
      : { message: fallback, error: fallback }) as T & {
      message?: string;
      error?: string;
    };
  }
  try {
    return JSON.parse(text) as T & { message?: string; error?: string };
  } catch {
    const fallback = `Respuesta inválida del servidor (${res.status})`;
    return { message: fallback, error: fallback } as T & {
      message?: string;
      error?: string;
    };
  }
}
