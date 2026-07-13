import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { lessonNotes } from "@esitef/db";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lessonId = req.nextUrl.searchParams.get("lessonId");
  const courseId = req.nextUrl.searchParams.get("courseId");
  if (!lessonId || !courseId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const db = getDb();
  const rows = await db
    .select({
      id: lessonNotes.id,
      contentHtml: lessonNotes.contentHtml,
      timestampSeconds: lessonNotes.timestampSeconds,
      createdAt: lessonNotes.createdAt,
    })
    .from(lessonNotes)
    .where(
      and(
        eq(lessonNotes.userId, session.user.id),
        eq(lessonNotes.lessonId, lessonId),
        eq(lessonNotes.courseId, courseId)
      )
    )
    .orderBy(desc(lessonNotes.createdAt));

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { lessonId, courseId, contentHtml, timestampSeconds } = body;
  if (!lessonId || !courseId || !contentHtml?.trim()) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const db = getDb();
  const [row] = await db
    .insert(lessonNotes)
    .values({
      userId: session.user.id,
      lessonId,
      courseId,
      contentHtml: String(contentHtml).trim().slice(0, 5000),
      timestampSeconds: timestampSeconds ?? null,
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const db = getDb();
  await db
    .delete(lessonNotes)
    .where(
      and(eq(lessonNotes.id, id), eq(lessonNotes.userId, session.user.id))
    );

  return NextResponse.json({ ok: true });
}
