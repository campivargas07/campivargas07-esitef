import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { quizAttempts, quizQuestions } from "@esitef/db";
import { getDb } from "@/lib/db";
import { issueCertificate } from "@/lib/lms";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { quizId, answers } = (await req.json()) as {
    quizId?: string;
    answers?: Record<string, number>;
  };

  if (!quizId || !answers) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const db = getDb();
  const questions = await db
    .select()
    .from(quizQuestions)
    .where(eq(quizQuestions.quizId, quizId));

  let correct = 0;
  for (const q of questions) {
    if (answers[q.id] === q.correctIndex) correct++;
  }

  const score = questions.length
    ? Math.round((correct / questions.length) * 100)
    : 0;
  const passed = score >= 70;

  const { quizzes: quizzesTable } = await import("@esitef/db");
  const [quizRow] = await db
    .select()
    .from(quizzesTable)
    .where(eq(quizzesTable.id, quizId))
    .limit(1);

  await db.insert(quizAttempts).values({
    quizId,
    userId: session.user.id,
    score,
    passed,
    answers,
  });

  if (passed && quizRow) {
    await issueCertificate(session.user.id, quizRow.courseId);
  }

  return NextResponse.json({ score, passed });
}
