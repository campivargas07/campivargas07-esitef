import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { orders } from "@esitef/db";
import { getDb } from "@/lib/db";
import { fulfillPaidOrder } from "@/lib/paypal-fulfillment";
import { capturePayPalOrder, isPayPalConfigured } from "@/lib/paypal";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isPayPalConfigured()) {
      return NextResponse.json(
        { error: "PayPal no está configurado." },
        { status: 503 }
      );
    }

    const body = (await req.json()) as {
      orderId?: string;
      paypalOrderId?: string;
    };

    if (!body.orderId || !body.paypalOrderId) {
      return NextResponse.json(
        { error: "orderId and paypalOrderId required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const [order] = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.id, body.orderId),
          eq(orders.userId, session.user.id),
          eq(orders.provider, "paypal")
        )
      )
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "paid") {
      await fulfillPaidOrder(order.id);
      return NextResponse.json({ ok: true, alreadyPaid: true });
    }

    if (order.providerOrderId && order.providerOrderId !== body.paypalOrderId) {
      return NextResponse.json({ error: "Order mismatch" }, { status: 409 });
    }

    const capture = await capturePayPalOrder(body.paypalOrderId);
    if (capture.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "El pago no se completó en PayPal." },
        { status: 402 }
      );
    }

    const captureId =
      capture.purchase_units?.[0]?.payments?.captures?.[0]?.id ??
      body.paypalOrderId;

    await fulfillPaidOrder(order.id, captureId);

    return NextResponse.json({ ok: true, captureId });
  } catch (err) {
    console.error("[checkout/paypal/capture]", err);
    const message =
      err instanceof Error ? err.message : "No se pudo capturar el pago.";
    return NextResponse.json({ error: message, message }, { status: 500 });
  }
}
