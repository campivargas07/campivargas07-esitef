import Link from "next/link";
import {
  formatAdminDateTime,
  formatAdminMoney,
  listAdminOrders,
  orderTypeLabel,
  type OrderStatus,
} from "@/lib/admin-orders";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";

type Props = {
  page: number;
  status?: string;
  q?: string;
};

function buildQuery(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "" && value !== "all") {
      sp.set(key, String(value));
    }
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export async function AdminOrdersTable({ page, status, q }: Props) {
  const { orders, total, pageSize } = await listAdminOrders({ page, status, q });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="admin-card">
      <form className="admin-filters" method="get" action="/admin/orders">
        <input
          type="search"
          name="q"
          placeholder="Buscar por email, nombre, producto o ID…"
          defaultValue={q ?? ""}
          aria-label="Buscar pedidos"
        />
        <select name="status" defaultValue={status ?? "all"} aria-label="Estado">
          <option value="all">Todos los estados</option>
          <option value="paid">Pagado</option>
          <option value="pending">Pendiente</option>
          <option value="failed">Fallido</option>
          <option value="refunded">Reembolsado</option>
          <option value="cancelled">Cancelado</option>
        </select>
        <button type="submit">Filtrar</button>
        {(q || (status && status !== "all")) && (
          <Link href="/admin/orders" className="admin-filter-reset">
            Limpiar
          </Link>
        )}
      </form>

      {orders.length === 0 ? (
        <div className="admin-empty">
          <h3>No hay pedidos</h3>
          <p>
            {q || status
              ? "Prueba con otros filtros de búsqueda."
              : "Los pedidos de cursos y sesiones online aparecerán aquí."}
          </p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="admin-order-link"
                    >
                      #{order.id.slice(0, 8)}
                    </Link>
                    {order.provider && (
                      <div className="admin-order-id">{order.provider}</div>
                    )}
                  </td>
                  <td>{formatAdminDateTime(order.createdAt)}</td>
                  <td>
                    <div>{order.customerName ?? "—"}</div>
                    <div className="admin-order-id">
                      {order.customerEmail ?? "—"}
                    </div>
                  </td>
                  <td>{order.itemSummary}</td>
                  <td>
                    <span className="admin-badge admin-badge--type">
                      {orderTypeLabel(order.orderType)}
                    </span>
                  </td>
                  <td>
                    <strong>
                      {formatAdminMoney(order.totalCents, order.currency)}
                    </strong>
                  </td>
                  <td>
                    <OrderStatusBadge status={order.status as OrderStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 0 && (
        <div className="admin-pagination">
          <span>
            {total} pedido{total === 1 ? "" : "s"}
            {totalPages > 1 && ` · Página ${page} de ${totalPages}`}
          </span>
          {totalPages > 1 && (
            <nav aria-label="Paginación">
              {page > 1 && (
                <Link
                  href={`/admin/orders${buildQuery({ page: page - 1, status, q })}`}
                  aria-label="Página anterior"
                >
                  ‹
                </Link>
              )}
              <span className="is-current" aria-current="page">
                {page}
              </span>
              {page < totalPages && (
                <Link
                  href={`/admin/orders${buildQuery({ page: page + 1, status, q })}`}
                  aria-label="Página siguiente"
                >
                  ›
                </Link>
              )}
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
