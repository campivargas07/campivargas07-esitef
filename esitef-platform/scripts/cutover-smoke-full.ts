#!/usr/bin/env tsx
/**
 * Smoke post-corte — stack completa (sin navegador).
 * Usage: SMOKE_BASE_URL=https://esitef.com npm run test:cutover-smoke
 */
const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";

const ROUTES_200 = [
  "/",
  "/formaciones",
  "/formaciones-presenciales",
  "/la-escuela",
  "/contacto",
  "/preguntas-frecuentes",
  "/sesiones-online",
  "/mentorias",
  "/ingresar",
  "/ingresar/olvidar",
  "/libros",
  "/articulos",
  "/espana",
];

const REDIRECTS: Array<{ from: string; toIncludes: string }> = [
  { from: "/online/masterclass", toIncludes: "/formaciones/masterclass" },
  { from: "/online/dashboard", toIncludes: "/dashboard" },
  { from: "/ofrecemos", toIncludes: "/formaciones-presenciales" },
  { from: "/que-haremos-en-una-terapia-online", toIncludes: "/sesiones-online" },
  { from: "/coaching-de-movimiento", toIncludes: "/mentorias" },
];

async function check200(path: string) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  if (res.status !== 200) {
    throw new Error(`${path} → ${res.status}`);
  }
}

async function checkRedirect(from: string, toIncludes: string) {
  const res = await fetch(`${BASE}${from}`, { redirect: "manual" });
  const location = res.headers.get("location") ?? "";
  if (res.status !== 307 && res.status !== 308 && res.status !== 301) {
    throw new Error(`${from} redirect status ${res.status}`);
  }
  if (!location.includes(toIncludes)) {
    throw new Error(`${from} → ${location}, expected ${toIncludes}`);
  }
}

async function checkForgotPasswordApi() {
  const res = await fetch(`${BASE}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "no-existe-cutover-smoke@esitef.com" }),
  });
  if (res.status !== 200) {
    throw new Error(`/api/auth/forgot-password → ${res.status}`);
  }
}

async function checkAssetsSample() {
  const assetsBase =
    process.env.NEXT_PUBLIC_ASSETS_BASE_URL?.replace(/\/$/, "") ||
    "https://assets.esitef.com";
  const sample = `${assetsBase}/`;
  const res = await fetch(sample, { method: "HEAD", redirect: "manual" }).catch(
    () => null
  );
  if (!res) {
    console.warn(`  ⚠ assets HEAD ${sample} no alcanzable (configurar subdominio)`);
    return;
  }
  if (res.status >= 500) {
    throw new Error(`assets ${sample} → ${res.status}`);
  }
  console.log(`  ✓ assets reachable (${res.status})`);
}

async function main() {
  console.log(`Cutover smoke ${BASE}\n`);

  for (const path of ROUTES_200) {
    await check200(path);
    console.log(`  ✓ ${path}`);
  }

  for (const r of REDIRECTS) {
    await checkRedirect(r.from, r.toIncludes);
    console.log(`  ✓ redirect ${r.from}`);
  }

  await checkForgotPasswordApi();
  console.log("  ✓ POST /api/auth/forgot-password");

  await checkAssetsSample();

  console.log("\nCutover smoke PASSED");
}

main().catch((err) => {
  console.error("Cutover smoke FAILED:", err instanceof Error ? err.message : err);
  process.exit(1);
});
