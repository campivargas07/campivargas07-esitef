"use client";

import { useCallback, useEffect, useState } from "react";

type Thread = {
  id: string;
  contentHtml: string;
  resolved: boolean;
  createdAt: string;
  authorName: string | null;
  replies: {
    id: string;
    contentHtml: string;
    createdAt: string;
    authorName: string | null;
  }[];
};

type Props = {
  lessonId: string;
  courseId: string;
  onClose: () => void;
};

export function DiscussionsPanel({ lessonId, courseId, onClose }: Props) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch(
      `/api/lessons/discussions?lessonId=${lessonId}&courseId=${courseId}`
    );
    if (res.ok) setThreads(await res.json());
    setLoading(false);
  }, [lessonId, courseId]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit() {
    if (!draft.trim()) return;
    const res = await fetch("/api/lessons/discussions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lessonId,
        courseId,
        contentHtml: draft.trim(),
        parentId: replyTo,
      }),
    });
    if (res.ok) {
      setDraft("");
      setReplyTo(null);
      load();
    }
  }

  return (
    <aside className="learn-panel" aria-label="Discusión de lección">
      <div className="learn-panel-header">
        <h3>Discusión</h3>
        <button type="button" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
      </div>
      <div className="learn-panel-body">
        {replyTo && (
          <p className="learn-panel-reply-hint">
            Respondiendo…{" "}
            <button type="button" onClick={() => setReplyTo(null)}>
              Cancelar
            </button>
          </p>
        )}
        <textarea
          className="learn-panel-input"
          placeholder={replyTo ? "Tu respuesta…" : "Haz una pregunta…"}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
        />
        <button type="button" className="btn btn-primary" onClick={submit}>
          {replyTo ? "Responder" : "Publicar"}
        </button>
        {loading ? (
          <p className="learn-panel-muted">Cargando…</p>
        ) : threads.length === 0 ? (
          <p className="learn-panel-muted">Sé el primero en preguntar.</p>
        ) : (
          <ul className="learn-panel-list learn-discussion-list">
            {threads.map((t) => (
              <li key={t.id}>
                <div className="learn-discussion-thread">
                  <strong>{t.authorName ?? "Alumno"}</strong>
                  <p>{t.contentHtml}</p>
                  <button type="button" onClick={() => setReplyTo(t.id)}>
                    Responder
                  </button>
                </div>
                {t.replies.map((r) => (
                  <div key={r.id} className="learn-discussion-reply">
                    <strong>{r.authorName ?? "Alumno"}</strong>
                    <p>{r.contentHtml}</p>
                  </div>
                ))}
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
