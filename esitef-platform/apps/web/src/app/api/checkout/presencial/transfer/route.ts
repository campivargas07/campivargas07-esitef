import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { parseAttributionFromBody } from "@/lib/attribution-request";
import { createPresencialTransferOrder } from "@/lib/presencial-transfer-order";
import {
  getPresencialBySlug,
  presencialAllowsGuestCheckout,
} from "@/lib/presenciales";
import { presencialUsesBankTransfer } from "@/lib/presencial-checkout";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = (await req.json()) as {
      instanceSlug?: string;
      planKey?: string;
      guestEmail?: string;
      guestName?: string;
      attribution?: unknown;
    };
    const attribution = parseAttributionFromBody(body);

    if (!body.instanceSlug || !body.planKey) {
      return NextResponse.json(
        { error: "instanceSlug and planKey required" },
        { status: 400 }
      );
    }

    const formacion = getPresencialBySlug(body.instanceSlug);
    if (!formacion || !presencialUsesBankTransfer(formacion.pais)) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const userId = session?.user?.id ?? null;
    if (!userId && !presencialAllowsGuestCheckout(body.instanceSlug)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await createPresencialTransferOrder({
      userId,
      guestEmail: body.guestEmail,
      guestName: body.guestName,
      instanceSlug: body.instanceSlug,
      planKey: body.planKey,
      attribution,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      orderId: result.orderId,
      instanceSlug: result.instanceSlug,
      planKey: result.planKey,
    });
  } catch (err) {
    console.error("[checkout/presencial/transfer]", err);
    const message =
      err instanceof Error ? err.message : "No se pudo registrar la inscripción.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
