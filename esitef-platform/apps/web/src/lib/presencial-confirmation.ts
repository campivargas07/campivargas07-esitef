import { eq } from "drizzle-orm";
import { orders, users } from "@esitef/db";
import { getDb } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { wrapTransactionalEmail } from "@/lib/email-html-wrapper";
import { getPresencialBySlug } from "@/lib/presenciales";
import { getPresencialCheckoutConfig } from "@/lib/presencial-checkout";

type PresencialOrderMeta = {
  type?: string;
  instanceSlug?: string;
  planKey?: string;
  subscription?: boolean;
  installments?: number;
  confirmationEmailSentAt?: string;
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

/** Send presencial inscription confirmation once per paid order. */
export async function sendPresencialInscriptionConfirmation(
  orderId: string
): Promise<boolean> {
  const db = getDb();
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order || order.status !== "paid") return false;

  const meta = (order.metadata ?? {}) as PresencialOrderMeta;
  if (meta.type !== "presencial" || !meta.instanceSlug || !meta.planKey) {
    return false;
  }
  if (meta.confirmationEmailSentAt) return true;
  if (!order.userId) return false;

  const [user] = await db
    .select({ email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, order.userId))
    .limit(1);

  if (!user?.email) return false;

  const formacion = getPresencialBySlug(meta.instanceSlug);
  const config = getPresencialCheckoutConfig(meta.instanceSlug);
  const plan = config?.plans[meta.planKey];
  const courseTitle = formacion
    ? [formacion.title, formacion.title_bold].filter(Boolean).join(" ")
    : meta.instanceSlug;
  const planName = plan?.name ?? meta.planKey;
  const sede = formacion?.sede ?? "";
  const amountLabel = formatMoney(order.totalCents, order.currency);
  const baseUrl = (process.env.AUTH_URL ?? "https://esitef.com").replace(
    /\/$/,
    ""
  );

  const subject = `Confirmación de inscripción — ${courseTitle}`;
  const text = [
    `Hola${user.name ? ` ${user.name}` : ""},`,
    "",
    `Tu inscripción presencial ha sido confirmada.`,
    "",
    `Formación: ${courseTitle}`,
    sede ? `Sede: ${sede}` : null,
    `Plan: ${planName}`,
    `Importe: ${amountLabel}`,
    "",
    meta.subscription
      ? "Has elegido el plan de 3 pagos mensuales. Los cobros siguientes se realizarán automáticamente."
      : "Pago recibido correctamente.",
    "",
    `Puedes ver tu cuenta en: ${baseUrl}/dashboard`,
    "",
    "— Equipo ESITEF",
  ]
    .filter((line) => line !== null)
    .join("\n");

  const innerHtml = `
    <p>Hola${user.name ? ` ${user.name}` : ""},</p>
    <p>Tu inscripción presencial ha sido <strong>confirmada</strong>.</p>
    <ul>
      <li><strong>Formación:</strong> ${courseTitle}</li>
      ${sede ? `<li><strong>Sede:</strong> ${sede}</li>` : ""}
      <li><strong>Plan:</strong> ${planName}</li>
      <li><strong>Importe:</strong> ${amountLabel}</li>
    </ul>
    <p>${
      meta.subscription
        ? "Has elegido el plan de 3 pagos mensuales. Los cobros siguientes se realizarán automáticamente."
        : "Pago recibido correctamente."
    }</p>
    <p><a class="email-link" href="${baseUrl}/dashboard">Ir a mi cuenta</a></p>
    <p>— Equipo ESITEF</p>
  `.trim();

  const html = wrapTransactionalEmail(innerHtml);

  const sent = await sendMail({ to: user.email, subject, html, text });
  if (!sent.ok) return false;

  await db
    .update(orders)
    .set({
      metadata: {
        ...meta,
        confirmationEmailSentAt: new Date().toISOString(),
      },
    })
    .where(eq(orders.id, orderId));

  return true;
}
