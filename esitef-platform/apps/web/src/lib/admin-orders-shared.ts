export type OrderStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "cancelled";

export type AdminOrderListItem = {
  id: string;
  status: OrderStatus;
  totalCents: number;
  currency: string;
  provider: string | null;
  createdAt: Date;
  paidAt: Date | null;
  customerName: string | null;
  customerEmail: string | null;
  itemSummary: string;
  orderType: "course" | "sesiones-online" | "other";
};

export function formatAdminMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function formatAdminDateTime(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatAdminDate(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function orderStatusLabel(status: OrderStatus) {
  const labels: Record<OrderStatus, string> = {
    paid: "Pagado",
    pending: "Pendiente",
    failed: "Fallido",
    refunded: "Reembolsado",
    cancelled: "Cancelado",
  };
  return labels[status] ?? status;
}

export function orderTypeLabel(type: AdminOrderListItem["orderType"]) {
  const labels: Record<AdminOrderListItem["orderType"], string> = {
    course: "Curso online",
    "sesiones-online": "Sesión online",
    other: "Otro",
  };
  return labels[type];
}
