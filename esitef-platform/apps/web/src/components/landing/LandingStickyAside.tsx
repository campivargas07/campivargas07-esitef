import Image from "next/image";
import { LandingHeroMeta } from "./LandingHeroMeta";
import { LandingPurchaseBar } from "./LandingPurchaseBar";
import type { OnlineCurrency } from "@/lib/online-currency";

const PLACEHOLDER =
  "https://esitef.com/online/wp-content/uploads/2022/12/esitef-inicio4-escuela-de-fisioterapia.webp";

function toEmbedUrl(url: string) {
  if (url.includes("youtube.com/watch")) {
    const id = new URL(url).searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split("?")[0];
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }
  if (url.includes("youtube.com/embed")) return url;
  return url;
}

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
  const hasVideo = Boolean(videoUrl);
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
          {hasVideo && videoUrl ? (
            <div className="tutor-ratio tutor-ratio-16x9">
              <iframe
                src={toEmbedUrl(videoUrl)}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
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
