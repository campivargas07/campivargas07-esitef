import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

export * from "./schema";

export function createDb(connectionString = process.env.DATABASE_URL!) {
  const client = postgres(connectionString, { max: 10 });
  return drizzle(client, { schema });
}

export type Database = ReturnType<typeof createDb>;
