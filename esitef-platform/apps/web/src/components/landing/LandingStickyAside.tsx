import Image from "next/image";
import { LandingHeroMeta } from "./LandingHeroMeta";
import { LandingPurchaseBar } from "./LandingPurchaseBar";
import type { OnlineCurrency } from "@/lib/online-currency";
import { toVideoEmbedUrl } from "@/lib/video-embed-url";

const PLACEHOLDER =
  "/img/esitef-inicio4-escuela-de-fisioterapia.webp";

type Props = {
  title: string;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  courseSlug: string;
  priceCents: number;
  currency: OnlineCurrency;
  enrolled: boolean;
  isLoggedIn: boolean;
  enrolledCount: number;
  durationLabel: string;
};

export function LandingStickyAside({
  title,
  thumbnailUrl,
  videoUrl,
  courseSlug,
  priceCents,
  currency,
  enrolled,
  isLoggedIn,
  enrolledCount,
  durationLabel,
}: Props) {
  const embedUrl = toVideoEmbedUrl(videoUrl ?? null);
  const hasVideo = Boolean(embedUrl);
  const hasMedia = hasVideo || Boolean(thumbnailUrl);

  return (
    <aside
      className="landing-layout__sticky"
      aria-label="Vista previa del curso"
    >
      {hasMedia && (
        <div
          className={`landing-hero__media${hasVideo ? " landing-hero__media--video" : ""}`}
        >
          {hasVideo && embedUrl ? (
            <div className="tutor-ratio tutor-ratio-16x9">
              <iframe
                src={embedUrl}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ) : (
            <Image
              src={thumbnailUrl || PLACEHOLDER}
              alt={title}
              width={800}
              height={1000}
              unoptimized
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
        </div>
      )}
      <LandingHeroMeta
        context="desktop"
        enrolledCount={enrolledCount}
        durationLabel={durationLabel}
      />
      <LandingPurchaseBar
        courseSlug={courseSlug}
        priceCents={priceCents}
        currency={currency}
        enrolled={enrolled}
        isLoggedIn={isLoggedIn}
      />
    </aside>
  );
}
