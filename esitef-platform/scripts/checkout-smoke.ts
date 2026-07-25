#!/usr/bin/env tsx
/**
 * Pre-corte checkout: Stripe keys + webhook + PayPal env si aplica.
 * Usage: npm run test:checkout-smoke
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function loadEnvLocal() {
  const path = join(ROOT, "apps/web/.env.local");
  try {
    const raw = readFileSync(path, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const i = trimmed.indexOf("=");
      if (i === -1) continue;
      const key = trimmed.slice(0, i).trim();
      const value = trimmed.slice(i + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    /* optional */
  }
}

async function main() {
  loadEnvLocal();
  console.log("=== Checkout smoke ===\n");

  const stripeOk = Boolean(
    process.env.STRIPE_SECRET_KEY?.startsWith("sk_") &&
      process.env.STRIPE_WEBHOOK_SECRET?.startsWith("whsec_") &&
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith("pk_")
  );
  if (!stripeOk) {
    throw new Error("Stripe env incompleta (sk_/whsec_/pk_)");
  }
  console.log("✓ Stripe env presente");

  const paypalClient = process.env.PAYPAL_CLIENT_ID?.trim();
  const paypalSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  if (paypalClient && paypalSecret) {
    console.log(`✓ PayPal env presente (mode=${process.env.PAYPAL_MODE ?? "sandbox"})`);
  } else {
    console.warn("⚠ PayPal no configurado — presenciales USD/MXN/ARS/COP sin PayPal");
  }

  const resend = process.env.RESEND_API_KEY?.trim();
  const mailFrom = process.env.MAIL_FROM?.trim();
  if (!resend || !mailFrom) {
    console.warn("⚠ RESEND_API_KEY o MAIL_FROM ausentes — emails transaccionales en log");
  } else {
    console.log("✓ Resend env presente");
  }

  console.log("\n→ Ejecutando verify:stripe (webhook + matrícula)…\n");
  const { spawnSync } = await import("node:child_process");
  const child = spawnSync("npm", ["run", "verify:stripe"], {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env,
  });
  if (child.status !== 0) {
    process.exit(child.status ?? 1);
  }

  console.log("\nCheckout smoke PASSED");
}

main().catch((err) => {
  console.error("\nCheckout smoke FAILED:", err instanceof Error ? err.message : err);
  process.exit(1);
});
