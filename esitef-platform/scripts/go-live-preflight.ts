#!/usr/bin/env tsx
/**
 * Pre-corte go-live: build, smoke remoto y estado del último delta.
 * Usage: SMOKE_BASE_URL=https://campivargas07-esitef-rho.vercel.app npm run go-live:preflight
 */
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const SMOKE_BASE = process.env.SMOKE_BASE_URL ?? "https://campivargas07-esitef-rho.vercel.app";

function step(label: string, fn: () => void) {
  process.stdout.write(`→ ${label}… `);
  fn();
  console.log("OK");
}

function main() {
  console.log("=== Go-live preflight ===\n");

  step("npm run build", () => {
    execSync("npm run build -w apps/web", { cwd: ROOT, stdio: "pipe" });
  });

  step(`smoke ${SMOKE_BASE}`, () => {
    execSync("npm run test:smoke", {
      cwd: ROOT,
      stdio: "inherit",
      env: { ...process.env, SMOKE_BASE_URL: SMOKE_BASE },
    });
  });

  const deltaPath = join(ROOT, "docs/cutover/DELTA-LATEST.md");
  if (!existsSync(deltaPath)) {
    throw new Error("Falta docs/cutover/DELTA-LATEST.md — ejecuta npm run cutover:delta");
  }
  const delta = readFileSync(deltaPath, "utf8");
  if (!delta.includes("Passed: true")) {
    throw new Error("Último delta no PASSED — ejecuta npm run cutover:delta");
  }
  console.log("→ delta local PASSED");

  const neonUrl = process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL ?? "";
  if (neonUrl.includes("neon.tech")) {
    console.log("→ DATABASE_URL apunta a Neon (listo para go-live:neon-delta)");
  } else {
    console.log(
      "\n⚠ Neon: exporta NEON_DATABASE_URL con la URL de producción y ejecuta npm run go-live:neon-delta",
    );
  }

  console.log("\n✅ Preflight PASSED — ver docs/cutover/GO-LIVE-EXECUTION.md Fase 2+");
}

main();
