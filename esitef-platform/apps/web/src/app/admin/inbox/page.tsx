import Link from "next/link";
import { formatAdminDate } from "@/lib/admin-leads";
import { listSupportConversations } from "@/lib/support-inbox";

export default async function AdminInboxPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const statusFilter =
    sp.status === "needs_human" ||
    sp.status === "bot" ||
    sp.status === "closed" ||
    sp.status === "open"
      ? sp.status
      : "open";

  const conversations = await listSupportConversations({
    status: statusFilter,
    limit: 80,
  });

  return (
    <>
      <header className="admin-page-header">
        <div>
          <h1>Inbox</h1>
          <p>Conversaciones de soporte por email (agente + humano).</p>
        </div>
      </header>

      <div className="admin-filters" style={{ marginBottom: "1rem" }}>
        {(
          [
            ["open", "Abiertas"],
            ["needs_human", "Necesitan humano"],
            ["bot", "Bot"],
            ["closed", "Cerradas"],
          ] as const
        ).map(([value, label]) => (
          <Link
            key={value}
            href={`/admin/inbox?status=${value}`}
            className={
              statusFilter === value
                ? "admin-btn admin-btn--primary"
                : "admin-btn admin-btn--secondary"
            }
            style={{ marginRight: "0.5rem" }}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="admin-card">
        <h2 className="admin-card-title">Conversaciones</h2>
        {conversations.length === 0 ? (
          <div className="admin-empty">
            <h3>Sin conversaciones</h3>
            <p>
              Cuando Resend entregue un email entrante al webhook, aparecerá
              aquí.
            </p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Último</th>
                  <th>Estado</th>
                  <th>Contacto</th>
                  <th>Asunto</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {conversations.map((c) => (
                  <tr key={c.id}>
                    <td>{formatAdminDate(c.lastMessageAt)}</td>
                    <td>
                      <span className="admin-topbar-badge">{c.status}</span>
                    </td>
                    <td>{c.contactEmail ?? c.contactPhone ?? "—"}</td>
                    <td>{c.subject ?? "—"}</td>
                    <td>
                      <Link href={`/admin/inbox/${c.id}`}>Abrir</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
