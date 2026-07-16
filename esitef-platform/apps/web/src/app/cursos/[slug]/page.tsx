import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { CourseCard } from "@/components/CourseCard";
import { LandingCurriculum } from "@/components/landing/LandingCurriculum";
import { LandingHeroMeta } from "@/components/landing/LandingHeroMeta";
import {
  LandingHighlights,
  LandingInstructor,
} from "@/components/landing/LandingSections";
import { LandingStickyAside } from "@/components/landing/LandingStickyAside";
import {
  formatCourseDuration,
  getCourseAboutHtml,
  getCourseBySlug,
  getCourseCurriculum,
  getEnrollmentCount,
  getFirstVideoUrl,
  getRelatedCourses,
  userHasEnrollment,
} from "@/lib/lms";
import {
  ONLINE_CURRENCY_COOKIE,
  normalizeOnlineCurrency,
  resolveOnlinePrice,
} from "@/lib/online-currency";

const INSTRUCTOR_AVATAR =
  "https://esitef.com/online/wp-content/uploads/2022/05/Asesoria-clinicas-fisioterapia_.png";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const session = await auth();
  const enrolled = session?.user?.id
    ? await userHasEnrollment(session.user.id, course.id)
    : false;

  const [curriculum, enrolledCount, related] = await Promise.all([
    getCourseCurriculum(course.id),
    getEnrollmentCount(course.id),
    getRelatedCourses(course.id),
  ]);

  const durationLabel = formatCourseDuration(curriculum);
  const videoUrl = getFirstVideoUrl(curriculum);
  const isLoggedIn = Boolean(session?.user);
  const aboutHtml = getCourseAboutHtml(course);

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
  return (
    <div className="landing-online-page">
      <div className="landing-layout">
        <nav className="landing-breadcrumb" aria-label="Ruta">
          <Link href="/formaciones">Formaciones</Link>
          <span className="landing-breadcrumb__sep" aria-hidden="true">
            /
          </span>
          <span className="landing-breadcrumb__current">{course.title}</span>
        </nav>

        <LandingStickyAside
          title={course.title}
          thumbnailUrl={course.thumbnailUrl}
          videoUrl={videoUrl}
          courseSlug={course.slug}
          priceCents={priced.amountMinor}
          currency={priced.currency}
          enrolled={enrolled}
          isLoggedIn={isLoggedIn}
          enrolledCount={Number(enrolledCount) || 0}
          durationLabel={durationLabel}
        />

        <div className="landing-layout__scroll">
          <section className="landing-hero" aria-label="Información del curso">
            <span className="landing-hero__category">Formación online</span>
            <h1 className="landing-hero__title">{course.title}</h1>
            {course.excerpt && (
              <p className="landing-hero__excerpt">{course.excerpt}</p>
            )}
            <div className="landing-hero__instructor">
              <div className="landing-hero__instructor-avatar">
                <Image
                  src={INSTRUCTOR_AVATAR}
                  alt="Tomás Bonino"
                  width={88}
                  height={88}
                  unoptimized
                />
              </div>
              <div>
                <span className="landing-hero__instructor-label">Profesor</span>
                <span className="landing-hero__instructor-name">
                  Tomás Bonino
                </span>
              </div>
            </div>
          </section>

          <LandingHighlights />

          {aboutHtml && (
            <section
              className="landing-section landing-about"
              aria-labelledby="landing-about-title"
            >
              <h2 id="landing-about-title" className="landing-section__title">
                Acerca del curso
              </h2>
              <div
                className="landing-about__content"
                dangerouslySetInnerHTML={{ __html: aboutHtml }}
              />
            </section>
          )}

          <LandingHeroMeta
            context="mobile"
            enrolledCount={Number(enrolledCount) || 0}
            durationLabel={durationLabel}
          />

          <LandingCurriculum curriculum={curriculum} />
          <LandingInstructor />

          {related.length > 0 && (
            <section
              className="landing-section landing-related"
              aria-labelledby="landing-related-title"
            >
              <h2 id="landing-related-title" className="landing-section__title">
                Te puede interesar
              </h2>
              <div className="formaciones-container">
                <div className="formaciones-grid">
                  {related.map((c) => (
                    <CourseCard
                      key={c.id}
                      slug={c.slug}
                      title={c.title}
                      excerpt={c.excerpt}
                      thumbnailUrl={c.thumbnailUrl}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
