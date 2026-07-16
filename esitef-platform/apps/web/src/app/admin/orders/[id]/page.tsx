import { AdminOrderDetailView } from "@/components/admin/AdminOrderDetailView";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminOrderDetailView orderId={id} />;
}
