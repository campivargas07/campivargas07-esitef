import Link from "next/link";
import {
  formatAdminDateTime,
  formatAdminMoney,
  getAdminOrderDetail,
  orderStatusLabel,
} from "@/lib/admin-orders";
import { AdminOrderActions } from "@/components/admin/AdminOrderActions";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";

type Props = {
  orderId: string;
};

export async function AdminOrderDetailView({ orderId }: Props) {
  const order = await getAdminOrderDetail(orderId);

  if (!order) {
    return (
      <div className="admin-empty">
        <h3>Pedido no encontrado</h3>
        <p>
          <Link href="/admin/orders">Volver al listado</Link>
        </p>
      </div>
    );
  }

  const customerName =
    order.user?.name ??
    (typeof order.metadata?.customerName === "string"
      ? order.metadata.customerName
      : order.booking?.customerName) ??
    "—";
  const customerEmail =
    order.user?.email ??
    (typeof order.metadata?.customerEmail === "string"
      ? order.metadata.customerEmail
      : order.booking?.customerEmail) ??
    "—";

  return (
    <>
      <Link href="/admin/orders" className="admin-back-link">
        ← Pedidos
      </Link>

      <div className="admin-detail-header">
        <div>
          <h1>Pedido #{order.id.slice(0, 8)}</h1>
          <p>
            Creado el {formatAdminDateTime(order.createdAt)}
            {order.paidAt && ` · Pagado el ${formatAdminDateTime(order.paidAt)}`}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="admin-detail-grid">
        <div className="admin-panel">
          <h2>Detalle del pedido</h2>
          <div className="admin-panel-body">
            <table className="admin-line-items">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cant.</th>
                  <th>Precio</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.courseSlug ? (
                        <Link href={`/cursos/${item.courseSlug}`}>
                          {item.title}
                        </Link>
                      ) : (
                        item.title
                      )}
                    </td>
                    <td>{item.quantity}</td>
                    <td>
                      {formatAdminMoney(item.unitPriceCents, order.currency)}
                    </td>
                    <td>
                      {formatAdminMoney(
                        item.unitPriceCents * item.quantity,
                        order.currency,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>Subtotal</td>
                  <td>{formatAdminMoney(order.subtotalCents, order.currency)}</td>
                </tr>
                {order.taxCents > 0 && (
                  <tr>
                    <td colSpan={3}>Impuestos</td>
                    <td>{formatAdminMoney(order.taxCents, order.currency)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={3}>Total</td>
                  <td>{formatAdminMoney(order.totalCents, order.currency)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div style={{ display: "grid", gap: "1rem" }}>
          <div className="admin-panel">
            <h2>Acciones</h2>
            <div className="admin-panel-body">
              <AdminOrderActions
                key={order.status}
                orderId={order.id}
                currentStatus={order.status}
              />
            </div>
          </div>

          <div className="admin-panel">
            <h2>Cliente</h2>
            <div className="admin-panel-body">
              <dl className="admin-meta-list">
                <div>
                  <dt>Nombre</dt>
                  <dd>{customerName}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>
                    <a href={`mailto:${customerEmail}`}>{customerEmail}</a>
                  </dd>
                </div>
                {order.user && (
                  <div>
                    <dt>Cuenta</dt>
                    <dd>
                      <Link href="/dashboard">Ver alumno</Link>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          <div className="admin-panel">
            <h2>Pago</h2>
            <div className="admin-panel-body">
              <dl className="admin-meta-list">
                <div>
                  <dt>Estado</dt>
                  <dd>{orderStatusLabel(order.status)}</dd>
                </div>
                <div>
                  <dt>Proveedor</dt>
                  <dd>{order.provider ?? "—"}</dd>
                </div>
                {order.providerOrderId && (
                  <div>
                    <dt>ID en proveedor</dt>
                    <dd>{order.providerOrderId}</dd>
                  </div>
                )}
                {order.legacyWpOrderId && (
                  <div>
                    <dt>Pedido WooCommerce</dt>
                    <dd>#{order.legacyWpOrderId}</dd>
                  </div>
                )}
              </dl>
              {order.payments.length > 0 && (
                <table className="admin-line-items" style={{ marginTop: "1rem" }}>
                  <thead>
                    <tr>
                      <th>Pago</th>
                      <th>Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.payments.map((p) => (
                      <tr key={p.id}>
                        <td>
                          {p.provider} · {p.status}
                          <div className="admin-order-id">{p.providerPaymentId}</div>
                        </td>
                        <td>{formatAdminMoney(p.amountCents, p.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {order.booking && (
            <div className="admin-panel">
              <h2>Reserva sesión online</h2>
              <div className="admin-panel-body">
                <dl className="admin-meta-list">
                  <div>
                    <dt>Fecha y hora</dt>
                    <dd>{formatAdminDateTime(order.booking.startsAt)}</dd>
                  </div>
                  <div>
                    <dt>Franja</dt>
                    <dd>{order.booking.timeSlot}</dd>
                  </div>
                  <div>
                    <dt>Estado reserva</dt>
                    <dd>{order.booking.status}</dd>
                  </div>
                  {order.booking.customerPhone && (
                    <div>
                      <dt>Teléfono</dt>
                      <dd>{order.booking.customerPhone}</dd>
                    </div>
                  )}
                  {order.booking.googleEventId && (
                    <div>
                      <dt>Google Calendar</dt>
                      <dd>{order.booking.googleEventId}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
