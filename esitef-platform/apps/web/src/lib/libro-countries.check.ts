import { formatLibroPhone } from "./libro-countries";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(formatLibroPhone("+34", "612 345 678") === "+34 612345678", "phone format");
assert(formatLibroPhone("+51", "") === "+51", "phone dial only");

console.log("libro-countries.check.ts OK");
