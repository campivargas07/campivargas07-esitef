import { createDb } from "@esitef/db";

let db: ReturnType<typeof createDb> | undefined;

export function getDb() {
  if (!db) {
    db = createDb(process.env.DATABASE_URL);
  }
  return db;
}
