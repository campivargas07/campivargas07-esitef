import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

export * from "./schema";

const RETRYABLE_DB =
  /CONNECT_TIMEOUT|ECONNRESET|ECONNREFUSED|connection terminated/i;

/** ponytail: one retry on Neon cold start; upgrade path: @neondatabase/serverless */
export async function withDbRetry<T>(
  fn: () => Promise<T>,
  retries = 1
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const code = (err as { code?: string })?.code;
    const msg = err instanceof Error ? err.message : String(err);
    if (
      retries > 0 &&
      (code === "CONNECT_TIMEOUT" || RETRYABLE_DB.test(msg))
    ) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return withDbRetry(fn, retries - 1);
    }
    throw err;
  }
}

export function createDb(connectionString = process.env.DATABASE_URL!) {
  const client = postgres(connectionString, {
    max: 10,
    connect_timeout: 30,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    prepare: false,
  });
  return drizzle(client, { schema });
}

export type Database = ReturnType<typeof createDb>;
