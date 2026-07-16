import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { cookies } from "next/headers";
import { orderItems, orders } from "@esitef/db";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import {
  formatSessionDateLabel,
  formatTimeSlotLabel,
  getSesionOnlinePrice,
  SESSION_COURSE_SLUG,
  SESSION_TIME_SLOTS,
  slotToInterval,
} from "@/lib/sesiones-online";
import {
  holdSesionOnlineSlot,
  releaseSesionOnlineSlot,
} from "@/lib/sesiones-online-bookings";
import { isDateBookable, getOpenSlotsForDate } from "@/lib/sesiones-online-availability";
import {
  buildSimCheckoutUrl,
  isSesionesOnlineSimulation,
} from "@/lib/sesiones-online-simulation";
import {
  normalizeOnlineCurrency,
  ONLINE_CURRENCY_COOKIE,
} from "@/lib/online-currency";

const checkoutSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeSlot: z.enum(SESSION_TIME_SLOTS),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Revisa los datos de la reserva." },
        { status: 400 },
      );
    }

    const { date, timeSlot, name, email, phone } = parsed.data;

    const bookable = await isDateBookable(date);
    const openSlots = bookable ? await getOpenSlotsForDate(date) : [];
    if (!bookable || !openSlots.includes(timeSlot)) {
      return NextResponse.json(
        { error: "La fecha u horario seleccionado ya no está disponible." },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const currency = normalizeOnlineCurrency(
      cookieStore.get(ONLINE_CURRENCY_COOKIE)?.value,
    );
    const priced = getSesionOnlinePrice(currency);
    const { start: startsAt, end: endsAt } = slotToInterval(date, timeSlot);

    const session = await auth();
    const db = getDb();
    const dateLabel = formatSessionDateLabel(date);
    const timeLabel = formatTimeSlotLabel(timeSlot);
    const title = `Sesión online — ${dateLabel}`;

    const [order] = await db
      .insert(orders)
      .values({
        userId: session?.user?.id ?? null,
        status: "pending",
        currency: priced.currency,
        subtotalCents: priced.amountMinor,
        totalCents: priced.amountMinor,
        provider: "stripe",
        metadata: {
          type: "sesiones-online",
          courseSlug: SESSION_COURSE_SLUG,
          date,
          timeSlot,
          customerName: name,
          customerEmail: email,
          ...(phone ? { customerPhone: phone } : {}),
        },
      })
      .returning();

    const held = await holdSesionOnlineSlot({
      orderId: order.id,
      date,
      timeSlot,
      name,
      email,
      ...(phone ? { phone } : {}),
      startsAt,
      endsAt,
    });

    if (!held) {
      await db.delete(orders).where(eq(orders.id, order.id));
      return NextResponse.json(
        { error: "Ese horario ya no está disponible. Elige otro." },
        { status: 409 },
      );
    }

    await db.insert(orderItems).values({
      orderId: order.id,
      title,
      unitPriceCents: priced.amountMinor,
    });

    const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";

    if (isSesionesOnlineSimulation()) {
      await db
        .update(orders)
        .set({ provider: "manual", providerOrderId: `sim_${order.id}` })
        .where(eq(orders.id, order.id));

      return NextResponse.json({
        url: buildSimCheckoutUrl(order.id, baseUrl),
        simulation: true,
      });
    }

    const stripe = getStripe();
    let checkoutSession;

    try {
      checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card", "paypal"],
        customer_email: email,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: priced.currency.toLowerCase(),
              unit_amount: priced.amountMinor,
              product_data: {
                name: title,
                description: `${timeLabel} · ${name}`,
              },
            },
          },
        ],
        success_url: `${baseUrl}/sesiones-online/confirmacion?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/sesiones-online?cancelado=1`,
        metadata: {
          orderId: order.id,
          type: "sesiones-online",
          date,
          timeSlot,
        },
        automatic_tax: { enabled: Boolean(process.env.STRIPE_TAX_ENABLED) },
      });
    } catch (stripeErr) {
      await releaseSesionOnlineSlot(order.id);
      await db.delete(orders).where(eq(orders.id, order.id));
      throw stripeErr;
    }

    await db
      .update(orders)
      .set({ providerOrderId: checkoutSession.id })
      .where(eq(orders.id, order.id));

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("[checkout/sesiones-online]", err);
    const message =
      err instanceof Error ? err.message : "No se pudo iniciar el pago.";
    return NextResponse.json(
      {
        error: message.includes("STRIPE_SECRET_KEY")
          ? "El pago online no está configurado. Contacta con ESITEF."
          : message,
        message,
      },
      { status: 500 },
    );
  }
}
