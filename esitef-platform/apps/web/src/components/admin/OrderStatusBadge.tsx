import type { OrderStatus } from "@/lib/admin-orders-shared";
import { orderStatusLabel } from "@/lib/admin-orders-shared";

export function OrderStatusBadge({ status }: { status: OrderStatus | string }) {
  const normalized = status as OrderStatus;
  return (
    <span className={`admin-badge admin-badge--${normalized}`}>
      {orderStatusLabel(normalized)}
    </span>
  );
}
