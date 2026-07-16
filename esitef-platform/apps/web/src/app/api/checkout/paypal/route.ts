import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createPayPalCourseOrder } from "@/lib/paypal-course-order";
import { getPayPalConfigStatus, isPayPalConfigured } from "@/lib/paypal";

export async function GET() {
  return NextResponse.json(getPayPalConfigStatus());
}

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

    const body = (await req.json()) as { courseSlug?: string; currency?: string };
    if (!body.courseSlug) {
      return NextResponse.json({ error: "courseSlug required" }, { status: 400 });
    }

    const result = await createPayPalCourseOrder({
      userId: session.user.id,
      courseSlug: body.courseSlug,
      currency: body.currency,
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
      courseSlug: result.courseSlug,
    });
  } catch (err) {
    console.error("[checkout/paypal]", err);
    const message =
      err instanceof Error ? err.message : "No se pudo iniciar el pago.";
    return NextResponse.json({ error: message, message }, { status: 500 });
  }
}
