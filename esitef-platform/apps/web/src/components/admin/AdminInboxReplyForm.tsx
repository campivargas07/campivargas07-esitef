"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminInboxReplyForm({
  conversationId,
}: {
  conversationId: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/inbox/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "No se pudo enviar");
        return;
      }
      setBody("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function closeConversation() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/inbox/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      });
      if (!res.ok) {
        setError("No se pudo cerrar");
        return;
      }
      router.push("/admin/inbox");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-card" style={{ marginTop: "1rem" }}>
      <h2 className="admin-card-title">Responder</h2>
      <form onSubmit={sendReply}>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          required
          placeholder="Escribe la respuesta al alumno…"
          style={{ width: "100%", marginBottom: "0.75rem" }}
          disabled={busy}
        />
        {error ? (
          <p role="alert" style={{ color: "#b00020", marginBottom: "0.75rem" }}>
            {error}
          </p>
        ) : null}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            type="submit"
            className="admin-btn admin-btn--primary"
            disabled={busy || !body.trim()}
          >
            Enviar respuesta
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--secondary"
            disabled={busy}
            onClick={closeConversation}
          >
            Cerrar conversación
          </button>
        </div>
      </form>
    </div>
  );
}
