"use client";

import { useCallback, useEffect, useState } from "react";

type Note = {
  id: string;
  contentHtml: string;
  timestampSeconds: number | null;
  createdAt: string;
};

type Props = {
  lessonId: string;
  courseId: string;
  onClose: () => void;
};

export function NotesPanel({ lessonId, courseId, onClose }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch(
      `/api/lessons/notes?lessonId=${lessonId}&courseId=${courseId}`
    );
    if (res.ok) setNotes(await res.json());
    setLoading(false);
  }, [lessonId, courseId]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!draft.trim()) return;
    const res = await fetch("/api/lessons/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lessonId,
        courseId,
        contentHtml: draft.trim(),
      }),
    });
    if (res.ok) {
      setDraft("");
      load();
    }
  }

  async function remove(id: string) {
    await fetch(`/api/lessons/notes?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <aside className="learn-panel" aria-label="Notas de lección">
      <div className="learn-panel-header">
        <h3>Notas</h3>
        <button type="button" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
      </div>
      <div className="learn-panel-body">
        <textarea
          className="learn-panel-input"
          placeholder="Escribe una nota…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
        />
        <button type="button" className="btn btn-primary" onClick={save}>
          Guardar nota
        </button>
        {loading ? (
          <p className="learn-panel-muted">Cargando…</p>
        ) : notes.length === 0 ? (
          <p className="learn-panel-muted">Sin notas en esta lección.</p>
        ) : (
          <ul className="learn-panel-list">
            {notes.map((n) => (
              <li key={n.id}>
                <p>{n.contentHtml}</p>
                <button type="button" onClick={() => remove(n.id)}>
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
