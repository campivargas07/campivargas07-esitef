"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  lessonId: string;
  title: string;
  contentHtml: string | null;
  videoUrl: string | null;
  courseSlug: string;
  initiallyCompleted?: boolean;
  nextLessonHref?: string | null;
};

export function LessonPlayer({
  lessonId,
  title,
  contentHtml,
  videoUrl,
  courseSlug,
  initiallyCompleted = false,
  nextLessonHref,
}: Props) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initiallyCompleted);

  async function markComplete() {
    await fetch("/api/lessons/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId }),
    });
    setCompleted(true);
    router.refresh();
  }

  return (
    <div className="card">
      {videoUrl && (
        <div
          style={{
            aspectRatio: "16/9",
            background: "#111",
            marginBottom: "1rem",
            borderRadius: 12,
          }}
        >
          <iframe
            src={videoUrl}
            title={title}
            style={{ width: "100%", height: "100%", border: 0, borderRadius: 12 }}
            allowFullScreen
          />
        </div>
      )}
      {contentHtml && (
        <div
          dangerouslySetInnerHTML={{ __html: contentHtml }}
          style={{ marginBottom: "1rem" }}
        />
      )}
      <button className="btn btn-primary" onClick={markComplete} disabled={completed}>
        {completed ? "Lección completada" : "Marcar como completada"}
      </button>
      {completed && nextLessonHref && (
        <p style={{ marginTop: "1rem" }}>
          <Link href={nextLessonHref}>Siguiente lección →</Link>
        </p>
      )}
      {completed && !nextLessonHref && (
        <p style={{ marginTop: "1rem" }}>
          <Link href={`/quiz/${courseSlug}`}>Ir al quiz del curso →</Link>
        </p>
      )}
    </div>
  );
}
