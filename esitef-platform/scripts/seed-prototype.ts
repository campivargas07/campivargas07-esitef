#!/usr/bin/env tsx
/**
 * Seeds a vertical prototype: demo course, lesson, quiz, admin user.
 */
import bcrypt from "bcryptjs";
import { createDb, courses, lessons, modules, quizQuestions, quizzes, users } from "@esitef/db";

async function main() {
  const db = createDb(process.env.DATABASE_URL!);
  const passwordHash = await bcrypt.hash("demo1234", 12);

  const [admin] = await db
    .insert(users)
    .values({
      email: "admin@esitef.com",
      name: "Admin ESITEF",
      role: "admin",
      passwordHash,
      passwordMigrated: true,
      emailVerified: new Date(),
    })
    .onConflictDoNothing()
    .returning();

  const [demo] = await db
    .insert(users)
    .values({
      email: "demo@esitef.com",
      name: "Demo Alumno",
      role: "student",
      passwordHash,
      passwordMigrated: true,
      emailVerified: new Date(),
    })
    .onConflictDoNothing()
    .returning();

  const [course] = await db
    .insert(courses)
    .values({
      slug: "introduccion-esitef",
      title: "Introducción a ESITEF Online",
      excerpt: "Curso de demostración para validar la migración.",
      description: "<p>Lección de bienvenida a la nueva plataforma.</p>",
      priceCents: 4900,
      currency: "EUR",
      published: true,
    })
    .onConflictDoNothing()
    .returning();

  if (!course) {
    console.log("Course already exists — skipping module/quiz seed.");
    return;
  }

  const [mod] = await db
    .insert(modules)
    .values({ courseId: course.id, title: "Módulo 1", sortOrder: 1 })
    .returning();

  await db.insert(lessons).values({
    moduleId: mod.id,
    title: "Bienvenida",
    contentHtml: "<p>Contenido migrado desde Tutor LMS.</p>",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    sortOrder: 1,
  });

  const [quiz] = await db
    .insert(quizzes)
    .values({ courseId: course.id, title: "Evaluación final", passingScore: 70 })
    .returning();

  await db.insert(quizQuestions).values([
    {
      quizId: quiz.id,
      prompt: "¿La plataforma nueva usa webhooks para confirmar pagos?",
      options: ["Sí", "No", "Solo la URL de éxito"],
      correctIndex: 0,
      sortOrder: 1,
    },
    {
      quizId: quiz.id,
      prompt: "¿Dónde se conservan los IDs de WordPress?",
      options: ["legacy_wp_user_id", "Se descartan", "En localStorage"],
      correctIndex: 0,
      sortOrder: 2,
    },
  ]);

  console.log("Seed complete:");
  console.log("  Admin: admin@esitef.com / demo1234");
  console.log("  Alumno: demo@esitef.com / demo1234");
  console.log("  Course: /cursos/introduccion-esitef");
  console.log("  Admin panel: /admin/orders");
  if (admin) console.log("  Admin id:", admin.id);
  if (demo) console.log("  Demo id:", demo.id);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
