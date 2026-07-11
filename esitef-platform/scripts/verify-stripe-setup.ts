#!/usr/bin/env tsx
/**
 * Verifica claves Stripe, firma de webhook y flujo orderId → matrícula.
 * Usage: npm run verify:stripe
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Stripe from "stripe";
import { and, eq } from "drizzle-orm";
import {
  courses,
  createDb,
  enrollments,
  orderItems,
  orders,
  users,
} from "@esitef/db";

const ROOT = join(import.meta.dirname, "..");
const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const DEMO_EMAIL = "demo@esitef.com";
const DEMO_COURSE = "introduccion-esitef";

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
    console.warn("No se encontró apps/web/.env.local");
  }
}

async function main() {
  loadEnvLocal();

  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const publishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();

  console.log("=== Verificación Stripe ===\n");

  if (!secretKey?.startsWith("sk_")) {
    throw new Error("STRIPE_SECRET_KEY ausente o inválida");
  }
  if (!webhookSecret?.startsWith("whsec_")) {
    throw new Error("STRIPE_WEBHOOK_SECRET ausente o inválida");
  }
  if (!publishable?.startsWith("pk_")) {
    throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ausente o inválida");
  }
  console.log("✓ Variables de entorno Stripe presentes");

  const stripe = new Stripe(secretKey, { apiVersion: "2025-02-24.acacia" });
  const balance = await stripe.balance.retrieve();
  console.log(`✓ API Stripe OK (balance disponible: ${balance.available.length} moneda(s))`);

  const noSig = await fetch(`${BASE}/api/webhooks/stripe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (noSig.status !== 400) {
    throw new Error(`Webhook sin firma debería devolver 400, recibió ${noSig.status}`);
  }
  console.log("✓ Endpoint webhook responde (rechaza peticiones sin firma)");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no configurada");
  }
  const db = createDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, DEMO_EMAIL))
    .limit(1);
  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.slug, DEMO_COURSE))
    .limit(1);

  if (!user || !course) {
    throw new Error(`Usuario demo o curso ${DEMO_COURSE} no encontrados en DB`);
  }

  const [order] = await db
    .insert(orders)
    .values({
      userId: user.id,
      status: "pending",
      currency: course.currency,
      subtotalCents: course.priceCents,
      totalCents: course.priceCents,
      provider: "stripe",
      metadata: { courseSlug: DEMO_COURSE, test: true },
    })
    .returning();

  await db.insert(orderItems).values({
    orderId: order.id,
    courseId: course.id,
    title: course.title,
    unitPriceCents: course.priceCents,
  });

  const eventId = `evt_test_${Date.now()}`;
  const sessionId = `cs_test_${Date.now()}`;
  const payload = JSON.stringify({
    id: eventId,
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: {
        id: sessionId,
        object: "checkout.session",
        mode: "payment",
        metadata: { orderId: order.id, courseId: course.id },
        customer: null,
        subscription: null,
      },
    },
  });

  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: webhookSecret,
  });

  const webhookRes = await fetch(`${BASE}/api/webhooks/stripe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": signature,
    },
    body: payload,
  });

  const webhookBody = (await webhookRes.json()) as { received?: boolean; error?: string };
  if (!webhookRes.ok || !webhookBody.received) {
    throw new Error(
      `Webhook simulado falló (${webhookRes.status}): ${webhookBody.error ?? JSON.stringify(webhookBody)}`
    );
  }
  console.log("✓ Webhook firmado aceptado (checkout.session.completed simulado)");

  const [paidOrder] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, order.id))
    .limit(1);
  if (paidOrder?.status !== "paid") {
    throw new Error(`Orden debería estar paid, está: ${paidOrder?.status}`);
  }
  console.log("✓ Orden marcada como pagada");

  const [enrollment] = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.userId, user.id), eq(enrollments.courseId, course.id)))
    .limit(1);

  if (!enrollment || enrollment.status !== "active") {
    throw new Error("Matrícula no creada tras webhook");
  }
  console.log("✓ Matrícula activa para demo@esitef.com");

  console.log("\nStripe setup PASSED — listo para checkout real en el navegador.");
  process.exit(0);
}

main().catch((err) => {
  console.error("\nStripe setup FAILED:", err instanceof Error ? err.message : err);
  process.exit(1);
});
