import { eq } from "drizzle-orm";
import { orderItems, orders, users } from "@esitef/db";
import { getDb } from "@/lib/db";
import { sendMail, escapeHtml } from "@/lib/mail";
import { CoursePurchaseConfirmationEmail } from "@/emails/course-purchase-confirmation";
import { renderEmailTemplate } from "@/lib/render-email";
import { appendPurchaseRow, appendPresencialRow } from "@/lib/google-purchases-sheet";
import { upsertChatwootContact } from "@/lib/chatwoot-contacts";
import { getPublicSiteUrl } from "@/lib/site-url";
import { getPresencialBySlug, formatPresencialSede, formatPresencialOrderLabel } from "@/lib/presenciales";
import { getPresencialCheckoutConfig } from "@/lib/presencial-checkout";

type CoursePurchaseMeta = {
  type?: string;
  courseConfirmationEmailSentAt?: string;
  purchaseAdminEmailSentAt?: string;
  purchaseSheetAppendedAt?: string;
  chatwootContactSyncedAt?: string;
  guestEmail?: string;
};

type PresencialTeamMeta = {
  type?: string;
  instanceSlug?: string;
  planKey?: string;
  sede?: string | null;
  purchaseAdminEmailSentAt?: string;
  purchaseSheetAppendedAt?: string;
  chatwootContactSyncedAt?: string;
  guestEmail?: string;
  guestName?: string;
  buyerName?: string;
};

type PresencialTeamContext = {
  orderId: string;
  courseTitle: string;
  sede: string;
  planName: string;
  amountLabel: string;
  amountMajor: string;
  currency: string;
  providerLabel: string;
  provider: string;
  userEmail: string;
  userName: string | null;
  paidAt: Date;
  adminUrl: string;
};

type OrderNotifyMeta = CoursePurchaseMeta | PresencialTeamMeta;

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
  patch: Partial<OrderNotifyMeta>
): Promise<void> {
  const db = getDb();
  const [order] = await db
    .select({ metadata: orders.metadata })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!order) return;

  const prev = (order.metadata ?? {}) as OrderNotifyMeta;
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

async function loadPresencialTeamContext(
  orderId: string
): Promise<PresencialTeamContext | null> {
  const db = getDb();
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order || order.status !== "paid") return null;

  const meta = (order.metadata ?? {}) as PresencialTeamMeta;
  if (meta.type !== "presencial" || !meta.instanceSlug || !meta.planKey) {
    return null;
  }

  const items = await db
    .select({ title: orderItems.title })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));
  const itemTitle = items[0]?.title ?? "";

  const formacion = getPresencialBySlug(meta.instanceSlug);
  const config = getPresencialCheckoutConfig(meta.instanceSlug);
  const plan = config?.plans[meta.planKey];
  const sede =
    formatPresencialSede(meta.sede) ||
    formatPresencialSede(formacion?.sede) ||
    "";
  const planName = plan?.name ?? meta.planKey;
  const courseTitle =
    itemTitle.includes("·") || !formacion
      ? itemTitle
      : formatPresencialOrderLabel({
          formacion,
          planName,
          instanceSlug: meta.instanceSlug,
        });

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
    userName =
      user?.name?.trim() ||
      (typeof meta.buyerName === "string" ? meta.buyerName.trim() : null) ||
      null;
  } else {
    userName =
      (typeof meta.guestName === "string" ? meta.guestName.trim() : null) || null;
  }

  if (!userEmail) return null;

  const paidAt = order.paidAt ?? new Date();

  return {
    orderId,
    courseTitle,
    sede,
    planName,
    amountLabel: formatMoney(order.totalCents, order.currency),
    amountMajor: String(order.totalCents / 100),
    currency: order.currency.toUpperCase(),
    providerLabel: providerLabel(order.provider),
    provider: order.provider ?? "—",
    userEmail,
    userName,
    paidAt,
    adminUrl: adminOrderUrl(orderId),
  };
}

async function sendPresencialAdminNotification(
  ctx: PresencialTeamContext
): Promise<boolean> {
  const sedeLine = ctx.sede ? `Sede: ${ctx.sede}` : null;
  const subjectSede = ctx.sede ? ` · ${ctx.sede}` : "";
  const text = [
    "Nueva inscripción presencial",
    "",
    `Fecha: ${ctx.paidAt.toISOString()}`,
    `Formación: ${ctx.courseTitle}`,
    sedeLine,
    `Plan: ${ctx.planName}`,
    `Importe: ${ctx.amountLabel}`,
    `Moneda: ${ctx.currency}`,
    `Método: ${ctx.providerLabel} (${ctx.provider})`,
    `Alumno: ${ctx.userName ?? "—"}`,
    `Email: ${ctx.userEmail}`,
    `Pedido: ${ctx.orderId}`,
    `Admin: ${ctx.adminUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  const sent = await sendMail({
    to: purchasesNotifyEmail(),
    subject: `[Inscripción presencial] ${ctx.courseTitle}${subjectSede} — ${ctx.amountLabel}`,
    html: `<pre style="font-family:monospace;white-space:pre-wrap">${escapeHtml(text)}</pre>`,
    text,
  });

  if (!sent.ok) {
    console.error("[notify-presencial-team] admin email failed", ctx.orderId);
  }
  return sent.ok;
}

function presencialSheetRowValues(ctx: PresencialTeamContext): string[] {
  return [
    ctx.paidAt.toISOString(),
    ctx.orderId,
    ctx.courseTitle,
    ctx.amountMajor,
    ctx.currency,
    ctx.provider,
    ctx.userEmail,
    ctx.userName ?? "",
    ctx.adminUrl,
  ];
}

/** Append one paid presencial order to the Presenciales sheet (idempotent via metadata flag). */
export async function syncPresencialOrderToSheet(
  orderId: string,
  opts?: { force?: boolean }
): Promise<boolean> {
  const ctx = await loadPresencialTeamContext(orderId);
  if (!ctx) return false;

  const db = getDb();
  const [order] = await db
    .select({ metadata: orders.metadata })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!order) return false;

  const meta = (order.metadata ?? {}) as PresencialTeamMeta;
  if (meta.purchaseSheetAppendedAt && !opts?.force) return true;

  const ok = await appendPresencialRow(presencialSheetRowValues(ctx));
  if (ok) {
    await patchOrderMeta(orderId, {
      purchaseSheetAppendedAt: new Date().toISOString(),
    });
  }
  return ok;
}

/** Admin alert, Presenciales sheet row, Chatwoot contact — each once per paid presencial order. */
export async function notifyPresencialTeam(orderId: string): Promise<void> {
  const ctx = await loadPresencialTeamContext(orderId);
  if (!ctx) return;

  const db = getDb();
  const [order] = await db
    .select({ metadata: orders.metadata })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!order) return;

  const meta = (order.metadata ?? {}) as PresencialTeamMeta;
  const now = new Date().toISOString();

  if (!meta.purchaseAdminEmailSentAt) {
    const ok = await sendPresencialAdminNotification(ctx);
    if (ok) {
      await patchOrderMeta(orderId, { purchaseAdminEmailSentAt: now });
    }
  }

  if (!meta.purchaseSheetAppendedAt) {
    await syncPresencialOrderToSheet(orderId);
  }

  if (!meta.chatwootContactSyncedAt) {
    const ok = await upsertChatwootContact({
      name: ctx.userName,
      email: ctx.userEmail,
    });
    if (ok) {
      await patchOrderMeta(orderId, { chatwootContactSyncedAt: now });
    }
  }
}

/** Student email, admin alert, Google Sheet row, Chatwoot contact — each once per order. */
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

  if (!meta.chatwootContactSyncedAt) {
    const ok = await upsertChatwootContact({
      name: ctx.userName,
      email: ctx.userEmail,
    });
    if (ok) {
      await patchOrderMeta(orderId, { chatwootContactSyncedAt: now });
    }
  }
}
