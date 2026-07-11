import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { lessonProgress } from "@esitef/db";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lessonId } = (await req.json()) as { lessonId?: string };
  if (!lessonId) {
    return NextResponse.json({ error: "lessonId required" }, { status: 400 });
  }

  const db = getDb();
  await db
    .insert(lessonProgress)
    .values({
      userId: session.user.id,
      lessonId,
      completed: true,
      completedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: { completed: true, completedAt: new Date(), updatedAt: new Date() },
    });

  return NextResponse.json({ ok: true });
}
