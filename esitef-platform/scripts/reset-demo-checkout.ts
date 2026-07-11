#!/usr/bin/env tsx
/**
 * Quita matrícula y órdenes de prueba del curso demo para volver a probar checkout.
 */
import { and, eq, inArray } from "drizzle-orm";
import {
  courses,
  createDb,
  enrollments,
  orderItems,
  orders,
  users,
} from "@esitef/db";

const DEMO_EMAIL = "demo@esitef.com";
const DEMO_COURSE = "introduccion-esitef";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL required");
  }

  const db = createDb(process.env.DATABASE_URL);
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
    throw new Error(`Usuario ${DEMO_EMAIL} o curso ${DEMO_COURSE} no encontrados`);
  }

  await db
    .delete(enrollments)
    .where(
      and(eq(enrollments.userId, user.id), eq(enrollments.courseId, course.id))
    );

  const items = await db
    .select({ orderId: orderItems.orderId })
    .from(orderItems)
    .where(eq(orderItems.courseId, course.id));

  const orderIds = [
    ...new Set(
      (
        await db
          .select({ id: orders.id })
          .from(orders)
          .where(eq(orders.userId, user.id))
      )
        .map((o) => o.id)
        .filter((id) => items.some((i) => i.orderId === id))
    ),
  ];

  if (orderIds.length) {
    await db.delete(orderItems).where(inArray(orderItems.orderId, orderIds));
    await db.delete(orders).where(inArray(orders.id, orderIds));
  }

  console.log("Reset demo checkout:");
  console.log(`  Usuario: ${DEMO_EMAIL}`);
  console.log(`  Curso: /cursos/${DEMO_COURSE}`);
  console.log("  → Matrícula y órdenes eliminadas. Puedes probar el pago de nuevo.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
