#!/usr/bin/env tsx
/**
 * Smoke test HTTP routes without a browser (CI / Codespaces friendly).
 * Usage: npm run test:smoke
 */
const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";

const ROUTES = [
  "/",
  "/formaciones",
  "/formaciones/masterclass",
  "/formaciones/talleres",
  "/la-escuela",
  "/contacto",
  "/preguntas-frecuentes",
  "/espana",
  "/ingresar",
];

const REDIRECTS: Array<{ from: string; toIncludes: string }> = [
  {
    from: "/gestion-funcional-fuerzas-medelli",
    toIncludes: "gestion-funcional-fuerzas-medellin",
  },
  {
    from: "/online/masterclass-estabilidad-core",
    toIncludes: "/cursos/masterclass-estabilidad-core",
  },
  {
    from: "/online/masterclass",
    toIncludes: "/formaciones/masterclass",
  },
  {
    from: "/online/talleres",
    toIncludes: "/formaciones/talleres",
  },
  {
    from: "/online/dashboard/my-courses",
    toIncludes: "/dashboard",
  },
];

async function check(path: string) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  if (res.status !== 200) {
    throw new Error(`${path} → ${res.status}`);
  }
}

async function checkRedirect(from: string, toIncludes: string) {
  const res = await fetch(`${BASE}${from}`, { redirect: "manual" });
  const location = res.headers.get("location") ?? "";
  if (res.status !== 307 && res.status !== 308) {
    throw new Error(`${from} redirect status ${res.status}, expected 307/308`);
  }
  if (!location.includes(toIncludes)) {
    throw new Error(`${from} → ${location}, expected ${toIncludes}`);
  }
}

async function main() {
  console.log(`Smoke test ${BASE}`);
  for (const path of ROUTES) {
    await check(path);
    console.log(`  ✓ ${path}`);
  }
  for (const r of REDIRECTS) {
    await checkRedirect(r.from, r.toIncludes);
    console.log(`  ✓ redirect ${r.from}`);
  }
  console.log("Smoke PASSED");
}

main().catch((err) => {
  console.error("Smoke FAILED:", err instanceof Error ? err.message : err);
  process.exit(1);
});
