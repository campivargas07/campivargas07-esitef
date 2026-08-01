import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminInboxReplyForm } from "@/components/admin/AdminInboxReplyForm";
import { formatAdminDate } from "@/lib/admin-leads";
import { getSupportConversation } from "@/lib/support-inbox";

export default async function AdminInboxDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const packed = await getSupportConversation(id);
  if (!packed) notFound();

  const { conversation: c, messages } = packed;

  return (
    <>
      <header className="admin-page-header">
        <div>
          <p>
            <Link href="/admin/inbox">← Inbox</Link>
          </p>
          <h1>{c.subject || "Conversación"}</h1>
          <p>
            {c.contactEmail ?? c.contactPhone} · {c.status}
            {c.escalateReason ? ` · ${c.escalateReason}` : ""}
          </p>
        </div>
      </header>

      <div className="admin-card">
        <h2 className="admin-card-title">Mensajes</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {messages.map((m) => (
            <li
              key={m.id}
              style={{
                borderBottom: "1px solid #eee",
                padding: "0.85rem 0",
              }}
            >
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#666",
                  marginBottom: "0.35rem",
                }}
              >
                {m.direction === "in" ? "Entrante" : m.fromBot ? "Bot" : "Humano"}{" "}
                · {formatAdminDate(m.createdAt)}
              </div>
              <div style={{ whiteSpace: "pre-wrap" }}>{m.body}</div>
            </li>
          ))}
        </ul>
      </div>

      {c.status !== "closed" ? (
        <AdminInboxReplyForm conversationId={c.id} />
      ) : null}
    </>
  );
}
