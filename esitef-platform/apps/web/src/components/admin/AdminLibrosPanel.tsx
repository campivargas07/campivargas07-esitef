import Link from "next/link";
import { AdminLibroPdfUpload } from "@/components/admin/AdminLibroPdfUpload";
import {
  formatAdminLibroDate,
  listAdminLibroLeads,
  listAdminLibros,
} from "@/lib/admin-libros";

export async function AdminLibrosPanel({
  libroKey,
}: {
  libroKey?: string;
}) {
  const [libros, leads] = await Promise.all([
    listAdminLibros(),
    listAdminLibroLeads({ libroKey, limit: 100 }),
  ]);

  return (
    <>
      <div className="admin-card">
        <h2 className="admin-card-title">Libros y PDFs</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Libro</th>
                <th>PDF</th>
                <th>Última subida</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {libros.map((book) => (
                <tr key={book.key}>
                  <td>
                    <strong>{book.title}</strong>
                    <div className="admin-table-muted">
                      <Link href={book.formPath} target="_blank" rel="noopener noreferrer">
                        Ver formulario
                      </Link>
                    </div>
                  </td>
                  <td>
                    {book.hasPdf ? (
                      <span className="admin-badge admin-badge--paid">Configurado</span>
                    ) : (
                      <span className="admin-badge admin-badge--pending">Sin PDF</span>
                    )}
                  </td>
                  <td>
                    {book.uploadedAt
                      ? formatAdminLibroDate(book.uploadedAt)
                      : "—"}
                  </td>
                  <td>
                    <AdminLibroPdfUpload
                      libroKey={book.key}
                      libroTitle={book.title}
                      hasPdf={book.hasPdf}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-card">
        <h2 className="admin-card-title">Descargas recientes</h2>
        <form className="admin-filters" method="get" action="/admin/libros">
          <select
            name="libroKey"
            defaultValue={libroKey ?? "all"}
            aria-label="Filtrar por libro"
          >
            <option value="all">Todos los libros</option>
            {libros.map((book) => (
              <option key={book.key} value={book.key}>
                {book.title}
              </option>
            ))}
          </select>
          <button type="submit">Filtrar</button>
          {libroKey && (
            <Link href="/admin/libros" className="admin-filter-reset">
              Limpiar
            </Link>
          )}
        </form>

        {leads.length === 0 ? (
          <div className="admin-empty">
            <h3>Sin descargas</h3>
            <p>Los envíos del formulario aparecerán aquí.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Libro</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>País</th>
                  <th>Profesión</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>{formatAdminLibroDate(lead.createdAt)}</td>
                    <td>{lead.libroTitle}</td>
                    <td>{lead.nombre}</td>
                    <td>{lead.email}</td>
                    <td>{lead.pais}</td>
                    <td>{lead.profesion}</td>
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
