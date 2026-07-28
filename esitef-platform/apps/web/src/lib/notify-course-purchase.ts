import { eq } from "drizzle-orm";
import { orderItems, orders, users } from "@esitef/db";
import { getDb } from "@/lib/db";
import { sendMail, escapeHtml } from "@/lib/mail";
import { CoursePurchaseConfirmationEmail } from "@/emails/course-purchase-confirmation";
import { renderEmailTemplate } from "@/lib/render-email";
import { appendPurchaseRow } from "@/lib/google-purchases-sheet";
import { getPublicSiteUrl } from "@/lib/site-url";

type CoursePurchaseMeta = {
  type?: string;
  courseConfirmationEmailSentAt?: string;
  purchaseAdminEmailSentAt?: string;
  purchaseSheetAppendedAt?: string;
  guestEmail?: string;
};

type CoursePurchaseContext = {
  orderId: string;
  courseTitle: string;
  amountLabel: string;
  amountMajor: string;
  currency: string;
  providerLabel: string;
  provider: string;
  userEmail: string;
  userName: string | null;
  paidAt: Date;
  adminUrl: string;
  siteUrl: string;
};

function formatMoney(cents: number, currency: string) {
  const major = cents / 100;
  try {
    return new Intl.NumberFormat("es", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(major);
  } catch {
    return `${major} ${currency.toUpperCase()}`;
  }
}

function providerLabel(provider: string | null): string {
  if (provider === "paypal") return "PayPal";
  if (provider === "stripe") return "Tarjeta";
  return provider ?? "—";
}

function purchasesNotifyEmail(): string {
  return (
    process.env.PURCHASES_NOTIFY_EMAIL?.trim() ||
    process.env.CONTACT_EMAIL?.trim() ||
    "info@esitef.com"
  );
}

function adminOrderUrl(orderId: string): string {
  const base = (process.env.AUTH_URL ?? getPublicSiteUrl()).replace(/\/$/, "");
  return `${base}/admin/orders/${orderId}`;
}

function isOnlineCourseOrder(
  meta: CoursePurchaseMeta,
  items: Array<{ courseId: string | null }>
): boolean {
  if (meta.type === "presencial" || meta.type === "sesiones-online") {
    return false;
  }
  return items.some((item) => Boolean(item.courseId));
}

async function loadCoursePurchaseContext(
  orderId: string
): Promise<CoursePurchaseContext | null> {
  const db = getDb();
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order || order.status !== "paid") return null;

  const meta = (order.metadata ?? {}) as CoursePurchaseMeta;
  const items = await db
    .select({ courseId: orderItems.courseId, title: orderItems.title })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  if (!isOnlineCourseOrder(meta, items)) return null;

  const courseItem = items.find((item) => item.courseId) ?? items[0];
  if (!courseItem) return null;

  let userEmail: string | null =
    typeof meta.guestEmail === "string"
      ? meta.guestEmail.trim().toLowerCase()
      : null;
  let userName: string | null = null;

  if (order.userId) {
    const [user] = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, order.userId))
      .limit(1);
    if (user?.email) userEmail = user.email;
    userName = user?.name?.trim() || null;
  }

  if (!userEmail) return null;

  const paidAt = order.paidAt ?? new Date();
  const siteUrl = getPublicSiteUrl();

  return {
    orderId,
    courseTitle: courseItem.title,
    amountLabel: formatMoney(order.totalCents, order.currency),
    amountMajor: String(order.totalCents / 100),
    currency: order.currency.toUpperCase(),
    providerLabel: providerLabel(order.provider),
    provider: order.provider ?? "—",
    userEmail,
    userName,
    paidAt,
    adminUrl: adminOrderUrl(orderId),
    siteUrl,
  };
}

async function patchOrderMeta(
  orderId: string,
  patch: Partial<CoursePurchaseMeta>
): Promise<void> {
  const db = getDb();
  const [order] = await db
    .select({ metadata: orders.metadata })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!order) return;

  const prev = (order.metadata ?? {}) as CoursePurchaseMeta;
  await db
    .update(orders)
    .set({ metadata: { ...prev, ...patch } })
    .where(eq(orders.id, orderId));
}

async function sendStudentConfirmation(
  ctx: CoursePurchaseContext
): Promise<boolean> {
  const subject = `Acceso confirmado — ${ctx.courseTitle}`;
  const text = [
    `Hola${ctx.userName ? ` ${ctx.userName}` : ""},`,
    "",
    "Hemos recibido tu pago y ya tienes acceso a la formación.",
    "",
    `Formación: ${ctx.courseTitle}`,
    `Importe: ${ctx.amountLabel}`,
    `Método: ${ctx.providerLabel}`,
    "",
    `Entra a tu cuenta: ${ctx.siteUrl}/dashboard`,
    "",
    "— Equipo ESITEF",
  ].join("\n");

  const { html, text: htmlText } = await renderEmailTemplate(
    CoursePurchaseConfirmationEmail({
      siteUrl: ctx.siteUrl,
      userName: ctx.userName,
      courseTitle: ctx.courseTitle,
      amountLabel: ctx.amountLabel,
      paymentMethodLabel: ctx.providerLabel,
    })
  );

  const sent = await sendMail({
    to: ctx.userEmail,
    subject,
    html,
    text: htmlText || text,
  });

  if (!sent.ok) {
    console.error("[notify-course-purchase] student email failed", ctx.orderId);
  }
  return sent.ok;
}

async function sendAdminNotification(
  ctx: CoursePurchaseContext
): Promise<boolean> {
  const text = [
    "Nueva compra de formación online",
    "",
    `Fecha: ${ctx.paidAt.toISOString()}`,
    `Curso: ${ctx.courseTitle}`,
    `Importe: ${ctx.amountLabel}`,
    `Moneda: ${ctx.currency}`,
    `Método: ${ctx.providerLabel} (${ctx.provider})`,
    `Alumno: ${ctx.userName ?? "—"}`,
    `Email: ${ctx.userEmail}`,
    `Pedido: ${ctx.orderId}`,
    `Admin: ${ctx.adminUrl}`,
  ].join("\n");

  const sent = await sendMail({
    to: purchasesNotifyEmail(),
    subject: `[Compra] ${ctx.courseTitle} — ${ctx.amountLabel}`,
    html: `<pre style="font-family:monospace;white-space:pre-wrap">${escapeHtml(text)}</pre>`,
    text,
  });

  if (!sent.ok) {
    console.error("[notify-course-purchase] admin email failed", ctx.orderId);
  }
  return sent.ok;
}

/** Student email, admin alert, and Google Sheet row — each once per order. */
export async function notifyCoursePurchase(orderId: string): Promise<void> {
  const ctx = await loadCoursePurchaseContext(orderId);
  if (!ctx) return;

  const db = getDb();
  const [order] = await db
    .select({ metadata: orders.metadata })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!order) return;

  const meta = (order.metadata ?? {}) as CoursePurchaseMeta;
  const now = new Date().toISOString();

  if (!meta.courseConfirmationEmailSentAt) {
    const ok = await sendStudentConfirmation(ctx);
    if (ok) {
      await patchOrderMeta(orderId, { courseConfirmationEmailSentAt: now });
    }
  }

  if (!meta.purchaseAdminEmailSentAt) {
    const ok = await sendAdminNotification(ctx);
    if (ok) {
      await patchOrderMeta(orderId, { purchaseAdminEmailSentAt: now });
    }
  }

  if (!meta.purchaseSheetAppendedAt) {
    const ok = await appendPurchaseRow([
      ctx.paidAt.toISOString(),
      ctx.orderId,
      ctx.courseTitle,
      ctx.amountMajor,
      ctx.currency,
      ctx.provider,
      ctx.userEmail,
      ctx.userName ?? "",
      ctx.adminUrl,
    ]);
    if (ok) {
      await patchOrderMeta(orderId, { purchaseSheetAppendedAt: now });
    }
  }
}
