import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { PayPalCheckoutPanel } from "@/components/checkout/PayPalCheckoutPanel";
import { getCourseBySlug, userHasEnrollmentForSlug } from "@/lib/lms";
import {
  ONLINE_CURRENCY_COOKIE,
  normalizeOnlineCurrency,
  resolveOnlinePrice,
} from "@/lib/online-currency";
import {
  getPayPalClientId,
  getPayPalSdkMode,
  isPayPalConfigured,
} from "@/lib/paypal";

export default async function CourseCheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) {
    return (
      <div className="container" style={{ padding: "3rem 0" }}>
        <p>Curso no encontrado.</p>
      </div>
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/ingresar?callbackUrl=${encodeURIComponent(`/cursos/${slug}/pagar`)}`);
  }

  const enrolled = await userHasEnrollmentForSlug(session.user.id, slug);
  if (enrolled) {
    redirect(`/aprender/${slug}`);
  }

  const cookieStore = await cookies();
  const preferred = normalizeOnlineCurrency(
    cookieStore.get(ONLINE_CURRENCY_COOKIE)?.value
  );
  const priced = resolveOnlinePrice({
    courseSlug: course.slug,
    preferred,
    fallbackCents: course.priceCents,
    fallbackCurrency: course.currency,
  });

  if (priced.amountMinor <= 0) {
    redirect(`/cursos/${slug}`);
  }

  if (!isPayPalConfigured()) {
    return (
      <div className="container" style={{ padding: "3rem 0" }}>
        <p>El pago online no está configurado. Contacta con ESITEF.</p>
        <Link href={`/cursos/${slug}`}>Volver al curso</Link>
      </div>
    );
  }

  return (
    <PayPalCheckoutPanel
      courseSlug={course.slug}
      courseTitle={course.title}
      courseThumbnailUrl={course.thumbnailUrl}
      amountMinor={priced.amountMinor}
      currency={priced.currency}
      clientId={getPayPalClientId()}
      sdkMode={getPayPalSdkMode()}
    />
  );
}
