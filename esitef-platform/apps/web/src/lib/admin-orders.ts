import {
  and,
  count,
  desc,
  eq,
  exists,
  gte,
  ilike,
  inArray,
  or,
  sql,
} from "drizzle-orm";
import {
  courses,
  orderItems,
  orders,
  payments,
  sesionOnlineBookings,
  users,
} from "@esitef/db";
import { getDb } from "@/lib/db";
import type {
  AdminOrderListItem,
  OrderStatus,
} from "@/lib/admin-orders-shared";

export type {
  AdminOrderListItem,
  OrderStatus,
} from "@/lib/admin-orders-shared";
export {
  formatAdminDate,
  formatAdminDateTime,
  formatAdminMoney,
  orderStatusLabel,
  orderTypeLabel,
} from "@/lib/admin-orders-shared";

export type AdminOrderStats = {
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  revenueCents: number;
  revenueCurrency: string;
  todayOrders: number;
};

export type AdminOrderDetail = {
  id: string;
  status: OrderStatus;
  currency: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  provider: string | null;
  providerOrderId: string | null;
  providerCustomerId: string | null;
  legacyWpOrderId: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  paidAt: Date | null;
  user: { id: string; email: string; name: string | null } | null;
  items: {
    id: string;
    title: string;
    quantity: number;
    unitPriceCents: number;
    courseId: string | null;
    courseSlug: string | null;
  }[];
  payments: {
    id: string;
    provider: string;
    providerPaymentId: string;
    amountCents: number;
    currency: string;
    status: string;
    createdAt: Date;
  }[];
  booking: {
    startsAt: Date;
    endsAt: Date;
    timeSlot: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string | null;
    status: string;
    googleEventId: string | null;
  } | null;
};

const PAGE_SIZE = 20;

function metadataString(
  metadata: Record<string, unknown> | null | undefined,
  key: string,
): string | null {
  const value = metadata?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function orderTypeFromMetadata(
  metadata: Record<string, unknown> | null | undefined,
): AdminOrderListItem["orderType"] {
  if (metadataString(metadata, "type") === "sesiones-online") {
    return "sesiones-online";
  }
  if (metadataString(metadata, "courseSlug")) return "course";
  return "other";
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getAdminOrderStats(): Promise<AdminOrderStats> {
  const db = getDb();
  const today = startOfToday();

  const [totals] = await db
    .select({
      totalOrders: count(),
      paidOrders: sql<number>`count(*) filter (where ${orders.status} = 'paid')`,
      pendingOrders: sql<number>`count(*) filter (where ${orders.status} = 'pending')`,
      revenueCents: sql<number>`coalesce(sum(${orders.totalCents}) filter (where ${orders.status} = 'paid'), 0)`,
    })
    .from(orders);

  const [todayRow] = await db
    .select({ todayOrders: count() })
    .from(orders)
    .where(gte(orders.createdAt, today));

  const [currencyRow] = await db
    .select({ currency: orders.currency })
    .from(orders)
    .where(eq(orders.status, "paid"))
    .orderBy(desc(orders.paidAt))
    .limit(1);

  return {
    totalOrders: Number(totals?.totalOrders ?? 0),
    paidOrders: Number(totals?.paidOrders ?? 0),
    pendingOrders: Number(totals?.pendingOrders ?? 0),
    revenueCents: Number(totals?.revenueCents ?? 0),
    revenueCurrency: currencyRow?.currency ?? "EUR",
    todayOrders: Number(todayRow?.todayOrders ?? 0),
  };
}

function buildSearchCondition(q: string, db: ReturnType<typeof getDb>) {
  const pattern = `%${q.trim()}%`;
  return or(
    ilike(sql`cast(${orders.id} as text)`, pattern),
    ilike(users.email, pattern),
    ilike(users.name, pattern),
    sql`${orders.metadata}->>'customerEmail' ilike ${pattern}`,
    sql`${orders.metadata}->>'customerName' ilike ${pattern}`,
    exists(
      db
        .select({ id: orderItems.id })
        .from(orderItems)
        .where(
          and(
            eq(orderItems.orderId, orders.id),
            ilike(orderItems.title, pattern),
          ),
        ),
    ),
  );
}

export async function listAdminOrders(options: {
  page?: number;
  status?: string;
  q?: string;
}): Promise<{ orders: AdminOrderListItem[]; total: number; pageSize: number }> {
  const db = getDb();
  const page = Math.max(1, options.page ?? 1);
  const status = options.status?.trim();
  const q = options.q?.trim();

  const conditions = [];
  if (status && status !== "all") {
    conditions.push(eq(orders.status, status as OrderStatus));
  }
  if (q) conditions.push(buildSearchCondition(q, db));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalRow] = await db
    .select({ total: count() })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .where(whereClause);

  const rows = await db
    .select({
      id: orders.id,
      status: orders.status,
      totalCents: orders.totalCents,
      currency: orders.currency,
      provider: orders.provider,
      createdAt: orders.createdAt,
      paidAt: orders.paidAt,
      metadata: orders.metadata,
      userName: users.name,
      userEmail: users.email,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .where(whereClause)
    .orderBy(desc(orders.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const orderIds = rows.map((r) => r.id);
  const itemsByOrder = new Map<string, string[]>();

  if (orderIds.length > 0) {
    const items = await db
      .select({ orderId: orderItems.orderId, title: orderItems.title })
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds));

    for (const item of items) {
      const list = itemsByOrder.get(item.orderId) ?? [];
      list.push(item.title);
      itemsByOrder.set(item.orderId, list);
    }
  }

  return {
    orders: rows.map((row) => {
      const meta = row.metadata as Record<string, unknown> | null;
      const itemTitles = itemsByOrder.get(row.id) ?? [];
      return {
        id: row.id,
        status: row.status as OrderStatus,
        totalCents: row.totalCents,
        currency: row.currency,
        provider: row.provider,
        createdAt: row.createdAt,
        paidAt: row.paidAt,
        customerName:
          row.userName ?? metadataString(meta, "customerName"),
        customerEmail:
          row.userEmail ?? metadataString(meta, "customerEmail"),
        itemSummary: itemTitles.join(", ") || "—",
        orderType: orderTypeFromMetadata(meta),
      };
    }),
    total: Number(totalRow?.total ?? 0),
    pageSize: PAGE_SIZE,
  };
}

export async function getAdminOrderDetail(
  orderId: string,
): Promise<AdminOrderDetail | null> {
  const db = getDb();

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) return null;

  const [user] = order.userId
    ? await db
        .select({ id: users.id, email: users.email, name: users.name })
        .from(users)
        .where(eq(users.id, order.userId))
        .limit(1)
    : [undefined];

  const items = await db
    .select({
      id: orderItems.id,
      title: orderItems.title,
      quantity: orderItems.quantity,
      unitPriceCents: orderItems.unitPriceCents,
      courseId: orderItems.courseId,
      courseSlug: courses.slug,
    })
    .from(orderItems)
    .leftJoin(courses, eq(orderItems.courseId, courses.id))
    .where(eq(orderItems.orderId, orderId));

  const paymentRows = await db
    .select()
    .from(payments)
    .where(eq(payments.orderId, orderId))
    .orderBy(desc(payments.createdAt));

  const [booking] = await db
    .select()
    .from(sesionOnlineBookings)
    .where(eq(sesionOnlineBookings.orderId, orderId))
    .limit(1);

  return {
    id: order.id,
    status: order.status as OrderStatus,
    currency: order.currency,
    subtotalCents: order.subtotalCents,
    taxCents: order.taxCents,
    totalCents: order.totalCents,
    provider: order.provider,
    providerOrderId: order.providerOrderId,
    providerCustomerId: order.providerCustomerId,
    legacyWpOrderId: order.legacyWpOrderId,
    metadata: (order.metadata as Record<string, unknown> | null) ?? null,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    user: user ?? null,
    items,
    payments: paymentRows.map((p) => ({
      id: p.id,
      provider: p.provider,
      providerPaymentId: p.providerPaymentId,
      amountCents: p.amountCents,
      currency: p.currency,
      status: p.status,
      createdAt: p.createdAt,
    })),
    booking: booking
      ? {
          startsAt: booking.startsAt,
          endsAt: booking.endsAt,
          timeSlot: booking.timeSlot,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          customerPhone: booking.customerPhone,
          status: booking.status,
          googleEventId: booking.googleEventId,
        }
      : null,
  };
}
