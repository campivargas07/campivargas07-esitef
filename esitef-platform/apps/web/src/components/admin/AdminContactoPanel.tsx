import {
  formatAdminDate,
  listAdminContactMessages,
} from "@/lib/admin-leads";

function truncate(text: string, max = 120) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

export async function AdminContactoPanel() {
  const messages = await listAdminContactMessages({ limit: 100 });

  return (
    <div className="admin-card">
      <h2 className="admin-card-title">Mensajes recientes</h2>

      {messages.length === 0 ? (
        <div className="admin-empty">
          <h3>Sin mensajes</h3>
          <p>Los envíos del formulario de contacto aparecerán aquí.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Mensaje</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr key={msg.id}>
                  <td>{formatAdminDate(msg.createdAt)}</td>
                  <td>{msg.nombre}</td>
                  <td>
                    <a href={`mailto:${msg.email}`}>{msg.email}</a>
                  </td>
                  <td title={msg.mensaje}>{truncate(msg.mensaje)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
