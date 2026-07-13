import { NextRequest, NextResponse } from "next/server";
import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";
import { lessonDiscussions, users } from "@esitef/db";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";

// ponytail: in-memory rate limit; resets on cold start; upgrade to Redis if abused
const postCounts = new Map<string, number[]>();

function rateLimited(key: string, max = 5, windowMs = 60_000) {
  const now = Date.now();
  const hits = (postCounts.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) return true;
  hits.push(now);
  postCounts.set(key, hits);
  return false;
}

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
  const threads = await db
    .select({
      id: lessonDiscussions.id,
      contentHtml: lessonDiscussions.contentHtml,
      resolved: lessonDiscussions.resolved,
      createdAt: lessonDiscussions.createdAt,
      authorName: users.name,
    })
    .from(lessonDiscussions)
    .innerJoin(users, eq(lessonDiscussions.userId, users.id))
    .where(
      and(
        eq(lessonDiscussions.lessonId, lessonId),
        eq(lessonDiscussions.courseId, courseId),
        isNull(lessonDiscussions.parentId)
      )
    )
    .orderBy(desc(lessonDiscussions.createdAt));

  const threadIds = threads.map((t) => t.id);
  let replies: {
    id: string;
    parentId: string | null;
    contentHtml: string;
    createdAt: Date;
    authorName: string | null;
  }[] = [];

  if (threadIds.length > 0) {
    replies = await db
      .select({
        id: lessonDiscussions.id,
        parentId: lessonDiscussions.parentId,
        contentHtml: lessonDiscussions.contentHtml,
        createdAt: lessonDiscussions.createdAt,
        authorName: users.name,
      })
      .from(lessonDiscussions)
      .innerJoin(users, eq(lessonDiscussions.userId, users.id))
      .where(inArray(lessonDiscussions.parentId, threadIds))
      .orderBy(asc(lessonDiscussions.createdAt));
  }

  const byParent = new Map<string, typeof replies>();
  for (const r of replies) {
    if (!r.parentId) continue;
    const list = byParent.get(r.parentId) ?? [];
    list.push(r);
    byParent.set(r.parentId, list);
  }

  return NextResponse.json(
    threads.map((t) => ({
      ...t,
      replies: byParent.get(t.id) ?? [],
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = `${session.user.id}`;
  if (rateLimited(key)) {
    return NextResponse.json({ error: "Rate limit" }, { status: 429 });
  }

  const body = await req.json();
  const { lessonId, courseId, contentHtml, parentId } = body;
  if (!lessonId || !courseId || !contentHtml?.trim()) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const db = getDb();
  const [row] = await db
    .insert(lessonDiscussions)
    .values({
      userId: session.user.id,
      lessonId,
      courseId,
      contentHtml: String(contentHtml).trim().slice(0, 5000),
      parentId: parentId ?? null,
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
