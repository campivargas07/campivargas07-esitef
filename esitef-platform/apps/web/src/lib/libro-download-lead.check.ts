/**
 * ponytail: self-check for libro download lead persistence.
 * Run: npx tsx src/lib/libro-download-lead.check.ts
 */
import { eq } from "drizzle-orm";
import { libroDownloadLeads } from "@esitef/db";
import { getDb } from "@/lib/db";
import { saveLibroDownloadLead } from "./libro-download-lead";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

async function main() {
  const testEmail = `libro-check-${Date.now()}@esitef.com`;

  await saveLibroDownloadLead({
    libroKey: "dolor",
    nombre: "Test User",
    pais: "España",
    ciudad: "Madrid",
    telefono: "600000000",
    email: testEmail,
    edad: "30",
    profesion: "Fisioterapeuta / Kinesiólogo",
  });

  const db = getDb();
  const [row] = await db
    .select()
    .from(libroDownloadLeads)
    .where(eq(libroDownloadLeads.email, testEmail))
    .limit(1);

  assert(row?.libroKey === "dolor", "lead row saved with libroKey");

  await db
    .delete(libroDownloadLeads)
    .where(eq(libroDownloadLeads.email, testEmail));

  console.log("libro-download-lead.check.ts OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
