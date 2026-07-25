"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toVideoEmbedUrl } from "@/lib/video-embed-url";

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
  const embedUrl = toVideoEmbedUrl(videoUrl);

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
      {embedUrl && (
        <div className="lesson-player__video">
          <iframe
            src={embedUrl}
            title={title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
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
