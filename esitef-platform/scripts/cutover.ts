#!/usr/bin/env tsx
/**
 * Cutover rehearsal, delta import trigger, and checklist printer.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const DOCS = join(ROOT, "docs/cutover");

const CHECKLIST = [
  "Backup verificable de MySQL WordPress + wp-content/uploads",
  "WordPress/Tutor en modo solo lectura",
  "Ejecutar ETL extract + load delta",
  "Ejecutar reconcile — sin issues bloqueantes",
  "Webhooks Stripe/PayPal de producción activos",
  "DNS apuntando a Next.js",
  "Puente auth WordPress activo (2–4 semanas)",
  "Monitoreo Sentry + alertas webhooks fallidos",
  "Plan de rollback documentado",
];

function printChecklist() {
  console.log("\n=== CUTOVER CHECKLIST ===\n");
  CHECKLIST.forEach((item, i) => console.log(`${i + 1}. [ ] ${item}`));
}

function rehearse() {
  mkdirSync(DOCS, { recursive: true });
  console.log("→ Running audit...");
  execSync("npm run audit", { cwd: ROOT, stdio: "inherit" });
  console.log("→ Running ETL extract...");
  execSync("npm run etl:extract", { cwd: ROOT, stdio: "inherit" });
  console.log("→ Running ETL load...");
  execSync("npm run etl:load", { cwd: ROOT, stdio: "inherit" });
  console.log("→ Running reconciliation...");
  execSync("npm run etl:reconcile", { cwd: ROOT, stdio: "inherit" });

  const reportPath = join(ROOT, "docs/audit/reconciliation-report.json");
  const report = JSON.parse(readFileSync(reportPath, "utf8"));
  const runbook = `# Ensayo de corte — ${new Date().toISOString()}

## Resultado de conciliación
- Passed: ${report.passed}
- Issues: ${report.issues.length ? report.issues.join(", ") : "ninguno"}

## Pasos siguientes
1. Revisar diferencias en reconciliation-report.json
2. Ejecutar pruebas manuales de login, pago sandbox y certificado
3. Programar ventana de corte con WordPress en solo lectura
`;
  writeFileSync(join(DOCS, "REHEARSAL-LATEST.md"), runbook);
  console.log(`\nRehearsal log: ${join(DOCS, "REHEARSAL-LATEST.md")}`);
  printChecklist();
}

function delta() {
  console.log("→ Delta import (extract + load + reconcile)...");
  execSync("npm run etl:extract", { cwd: ROOT, stdio: "inherit" });
  execSync("npm run etl:load", { cwd: ROOT, stdio: "inherit" });
  execSync("npm run etl:reconcile", { cwd: ROOT, stdio: "inherit" });
  console.log("Delta import complete.");
}

const cmd = process.argv[2];
switch (cmd) {
  case "rehearse":
    rehearse();
    break;
  case "delta":
    delta();
    break;
  case "checklist":
    printChecklist();
    break;
  default:
    console.log("Usage: cutover <rehearse|delta|checklist>");
    process.exit(1);
}
