import {
  formatAdminDate,
  listAdminNewsletterSubscribers,
} from "@/lib/admin-leads";

export async function AdminNewsletterPanel() {
  const subscribers = await listAdminNewsletterSubscribers({ limit: 100 });

  return (
    <div className="admin-card">
      <h2 className="admin-card-title">Suscriptores activos</h2>

      {subscribers.length === 0 ? (
        <div className="admin-empty">
          <h3>Sin suscriptores</h3>
          <p>Las altas del newsletter aparecerán aquí.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Email</th>
                <th>Origen</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr key={sub.id}>
                  <td>{formatAdminDate(sub.subscribedAt)}</td>
                  <td>
                    <a href={`mailto:${sub.email}`}>{sub.email}</a>
                  </td>
                  <td>{sub.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
