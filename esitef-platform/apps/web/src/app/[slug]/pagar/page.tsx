import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PayPalCheckoutPanel } from "@/components/checkout/PayPalCheckoutPanel";
import {
  getPresencialCheckoutConfig,
  isPresencialCheckoutEnabled,
  toStripeAmount,
} from "@/lib/presencial-checkout";
import {
  getPresencialBySlug,
  PRESENCIAL_SLUGS,
  resolvePresencialSlug,
} from "@/lib/presenciales";
import {
  getPayPalClientId,
  getPayPalSdkMode,
  isPayPalConfigured,
} from "@/lib/paypal";
import type { OnlineCurrency } from "@/lib/online-currency";

export const dynamicParams = false;

export function generateStaticParams() {
  return PRESENCIAL_SLUGS.filter((slug) => isPresencialCheckoutEnabled(slug)).map(
    (slug) => ({ slug })
  );
}

export default async function PresencialCheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ plan?: string }>;
}) {
  const { slug } = await params;
  const { plan: planKey } = await searchParams;
  const resolvedSlug = resolvePresencialSlug(slug);
  const formacion = getPresencialBySlug(resolvedSlug);
  const config = getPresencialCheckoutConfig(resolvedSlug);
  const plan = planKey ? config?.plans[planKey] : null;

  if (!formacion || !config?.checkout_enabled || !planKey || !plan) {
    return (
      <div className="container" style={{ padding: "3rem 0" }}>
        <p>Plan de inscripción no encontrado.</p>
        <Link href={`/${resolvedSlug}`}>Volver a la formación</Link>
      </div>
    );
  }

  if (plan.subscription) {
    redirect(`/${resolvedSlug}#inscribirme`);
  }

  const session = await auth();
  if (!session?.user?.id) {
    redirect(
      `/ingresar?callbackUrl=${encodeURIComponent(`/${resolvedSlug}/pagar?plan=${planKey}`)}`
    );
  }

  if (!isPayPalConfigured()) {
    return (
      <div className="container" style={{ padding: "3rem 0" }}>
        <p>El pago online no está configurado. Contacta con ESITEF.</p>
        <Link href={`/${resolvedSlug}`}>Volver a la formación</Link>
      </div>
    );
  }

  const currency = config.currency.toUpperCase() as OnlineCurrency;
  const amountMinor = toStripeAmount(plan.price, currency);
  const courseTitle = [formacion.title, formacion.title_bold]
    .filter(Boolean)
    .join(" ");

  return (
    <PayPalCheckoutPanel
      courseSlug={resolvedSlug}
      courseTitle={`${courseTitle} — ${plan.name}`}
      courseThumbnailUrl={formacion.hero_image?.url}
      amountMinor={amountMinor}
      currency={currency}
      clientId={getPayPalClientId()}
      sdkMode={getPayPalSdkMode()}
      backHref={`/${resolvedSlug}#inscribirme`}
      presencial={{ instanceSlug: resolvedSlug, planKey }}
    />
  );
}
