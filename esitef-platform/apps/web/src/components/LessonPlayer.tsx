"use client";

import { useState } from "react";

type Props = {
  lessonId: string;
  title: string;
  contentHtml: string | null;
  videoUrl: string | null;
  courseSlug: string;
};

export function LessonPlayer({ lessonId, title, contentHtml, videoUrl, courseSlug }: Props) {
  const [completed, setCompleted] = useState(false);

  async function markComplete() {
    await fetch("/api/lessons/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId }),
    });
    setCompleted(true);
  }

  return (
    <div className="card">
      <h2 style={{ marginBottom: "1rem" }}>{title}</h2>
      {videoUrl && (
        <div style={{ aspectRatio: "16/9", background: "#111", marginBottom: "1rem", borderRadius: 12 }}>
          <iframe
            src={videoUrl}
            title={title}
            style={{ width: "100%", height: "100%", border: 0, borderRadius: 12 }}
            allowFullScreen
          />
        </div>
      )}
      {contentHtml && (
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} style={{ marginBottom: "1rem" }} />
      )}
      <button className="btn btn-primary" onClick={markComplete} disabled={completed}>
        {completed ? "Lección completada" : "Marcar como completada"}
      </button>
      {completed && (
        <p style={{ marginTop: "1rem" }}>
          <a href={`/quiz/${courseSlug}`}>Ir al quiz del curso →</a>
        </p>
      )}
    </div>
  );
}
