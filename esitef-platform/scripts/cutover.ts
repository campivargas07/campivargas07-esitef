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

  let deltaPassed = false;
  try {
    const report = JSON.parse(
      readFileSync(join(ROOT, "docs/audit/reconciliation-report.json"), "utf8")
    );
    deltaPassed = Boolean(report.passed);
  } catch {
    /* no report yet */
  }

  const status = `# Checklist go-live — ${new Date().toISOString()}

## Automático (local)
- [${deltaPassed ? "x" : " "}] ETL delta + reconcile (${deltaPassed ? "PASSED" : "pendiente"})

## Manual (producción)
${CHECKLIST.map((item, i) => `${i + 1}. [ ] ${item}`).join("\n")}

Ver \`docs/cutover/CUTOVER-RUNBOOK.md\` para el procedimiento completo.
`;
  mkdirSync(DOCS, { recursive: true });
  writeFileSync(join(DOCS, "CHECKLIST-STATUS.md"), status);
  console.log(`\nChecklist guardado: ${join(DOCS, "CHECKLIST-STATUS.md")}`);
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
  if (!report.passed) {
    console.error("\nRehearsal FAILED — reconcile issues:", report.issues);
    process.exit(1);
  }
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
  mkdirSync(DOCS, { recursive: true });
  console.log("→ Delta import (extract + load + reconcile)...");
  execSync("npm run etl:extract", { cwd: ROOT, stdio: "inherit", env: process.env });
  execSync("npm run etl:load", { cwd: ROOT, stdio: "inherit", env: process.env });
  execSync("npm run etl:reconcile", { cwd: ROOT, stdio: "inherit", env: process.env });

  const reportPath = join(ROOT, "docs/audit/reconciliation-report.json");
  const report = JSON.parse(readFileSync(reportPath, "utf8"));
  const runbook = `# Delta import — ${new Date().toISOString()}

## Resultado de conciliación
- Passed: ${report.passed}
- Issues: ${report.issues.length ? report.issues.join(", ") : "ninguno"}

## Conteos fuente → destino
- users: ${report.source.users} → ${report.target.users}
- courses: ${report.source.courses} → ${report.target.courses}
- lessonProgress: ${report.source.lessonProgress} → ${report.target.lessonProgress}
- orders: ${report.source.orders} → ${report.target.orders}

## Siguiente paso
1. Validar login de usuarios migrados y progreso de lecciones
2. Ejecutar \`npm run export:wp-redirects\` (plugin Redirection + slugs cursos)
3. Completar checklist: \`npm run cutover:checklist\`
`;
  writeFileSync(join(DOCS, "DELTA-LATEST.md"), runbook);
  console.log(`\nDelta log: ${join(DOCS, "DELTA-LATEST.md")}`);

  if (!report.passed) {
    console.error("\nDelta FAILED — reconcile issues:", report.issues);
    process.exit(1);
  }
  console.log("Delta import complete — reconcile PASSED.");
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
