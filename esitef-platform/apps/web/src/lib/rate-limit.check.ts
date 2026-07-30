/**
 * Self-check for in-memory rate limit.
 * Run: npx tsx src/lib/rate-limit.check.ts
 */
import { rateLimited } from "./rate-limit";

const key = `check:${Date.now()}`;
if (rateLimited(key, 2, 60_000)) throw new Error("1st hit should pass");
if (rateLimited(key, 2, 60_000)) throw new Error("2nd hit should pass");
if (!rateLimited(key, 2, 60_000)) throw new Error("3rd hit should block");
console.log("rate-limit.check OK");
