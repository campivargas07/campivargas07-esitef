import {
  formatAdminMoney,
  getAdminOrderStats,
} from "@/lib/admin-orders";
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const stats = await getAdminOrderStats();

  return (
    <>
      <header className="admin-page-header">
        <div>
          <h1>Pedidos</h1>
          <p>Gestiona compras de cursos online y sesiones con Tomás Bonino.</p>
        </div>
      </header>

      <div className="admin-stats" aria-label="Resumen de pedidos">
        <div className="admin-stat-card">
          <strong>{stats.totalOrders}</strong>
          <span>Total pedidos</span>
        </div>
        <div className="admin-stat-card">
          <strong>{stats.paidOrders}</strong>
          <span>Pagados</span>
        </div>
        <div className="admin-stat-card">
          <strong>{stats.pendingOrders}</strong>
          <span>Pendientes</span>
        </div>
        <div className="admin-stat-card">
          <strong>
            {formatAdminMoney(stats.revenueCents, stats.revenueCurrency)}
          </strong>
          <span>Ingresos (pagados)</span>
        </div>
      </div>

      <AdminOrdersTable page={page} status={params.status} q={params.q} />
    </>
  );
}
