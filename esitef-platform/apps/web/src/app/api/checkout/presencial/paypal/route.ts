import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createPayPalPresencialOrder } from "@/lib/paypal-presencial-order";
import { isPayPalConfigured } from "@/lib/paypal";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isPayPalConfigured()) {
      return NextResponse.json(
        { error: "PayPal no está configurado en el servidor." },
        { status: 503 }
      );
    }

    const body = (await req.json()) as {
      instanceSlug?: string;
      planKey?: string;
    };

    if (!body.instanceSlug || !body.planKey) {
      return NextResponse.json(
        { error: "instanceSlug and planKey required" },
        { status: 400 }
      );
    }

    const result = await createPayPalPresencialOrder({
      userId: session.user.id,
      instanceSlug: body.instanceSlug,
      planKey: body.planKey,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      orderId: result.orderId,
      paypalOrderId: result.paypalOrderId,
      currency: result.currency,
      amountMinor: result.amountMinor,
      courseTitle: result.courseTitle,
      instanceSlug: result.instanceSlug,
      planKey: result.planKey,
    });
  } catch (err) {
    console.error("[checkout/presencial/paypal]", err);
    const message =
      err instanceof Error ? err.message : "No se pudo iniciar el pago.";
    return NextResponse.json({ error: message, message }, { status: 500 });
  }
}
