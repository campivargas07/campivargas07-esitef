import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PresencialTransferPanel } from "@/components/presencial/PresencialTransferPanel";
import {
  getPresencialCheckoutConfig,
  isPresencialCheckoutEnabled,
  presencialUsesBankTransfer,
} from "@/lib/presencial-checkout";
import {
  getPresencialBySlug,
  isPresencialPast,
  PRESENCIAL_SLUGS,
  presencialAllowsGuestCheckout,
  resolvePresencialSlug,
} from "@/lib/presenciales";

export const dynamicParams = false;
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return PRESENCIAL_SLUGS.filter((slug) => {
    const formacion = getPresencialBySlug(slug);
    return (
      isPresencialCheckoutEnabled(slug) &&
      presencialUsesBankTransfer(formacion?.pais)
    );
  }).map((slug) => ({ slug }));
}

export default async function PresencialTransferPage({
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

  if (
    !formacion ||
    isPresencialPast(formacion) ||
    !config?.checkout_enabled ||
    !presencialUsesBankTransfer(formacion.pais) ||
    !planKey ||
    !plan ||
    plan.subscription
  ) {
    if (formacion && isPresencialPast(formacion)) {
      redirect("/formaciones-presenciales");
    }
    return (
      <div className="container" style={{ padding: "3rem 0" }}>
        <p>Plan de inscripción no encontrado.</p>
        <Link href={`/${resolvedSlug}`}>Volver a la formación</Link>
      </div>
    );
  }

  const guestCheckout = presencialAllowsGuestCheckout(resolvedSlug);
  const session = await auth();
  if (!session?.user?.id && !guestCheckout) {
    redirect(
      `/ingresar?callbackUrl=${encodeURIComponent(`/${resolvedSlug}/transferir?plan=${planKey}`)}`
    );
  }

  const inscription = formacion.inscription;
  if (!inscription?.accounts?.length) {
    return (
      <div className="container" style={{ padding: "3rem 0" }}>
        <p>Los datos bancarios no están disponibles. Contacta con ESITEF.</p>
        <Link href={`/${resolvedSlug}`}>Volver a la formación</Link>
      </div>
    );
  }

  const courseTitle = [formacion.title, formacion.title_bold]
    .filter(Boolean)
    .join(" ");

  return (
    <PresencialTransferPanel
      instanceSlug={resolvedSlug}
      planKey={planKey}
      plan={plan}
      courseTitle={courseTitle}
      inscription={inscription}
      guestCheckout={guestCheckout && !session?.user?.id}
      buyerName={session?.user?.name ?? undefined}
      buyerEmail={session?.user?.email ?? undefined}
      backHref={`/${resolvedSlug}#inscribirme`}
    />
  );
}
