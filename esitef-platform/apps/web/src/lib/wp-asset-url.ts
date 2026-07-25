const DEFAULT_ASSETS_BASE = "https://assets.esitef.com";

const WP_UPLOAD_PATTERNS = [
  /https?:\/\/(?:www\.)?esitef\.com\/online\/wp-content\/uploads\//i,
  /https?:\/\/(?:www\.)?esitef\.com\/wp-content\/uploads\//i,
];

function assetsBase(): string {
  return (
    process.env.NEXT_PUBLIC_ASSETS_BASE_URL?.trim().replace(/\/$/, "") ||
    DEFAULT_ASSETS_BASE
  );
}

/** Rewrites legacy WordPress upload URLs to the static assets CDN. */
export function wpAssetUrl(url: string | null | undefined): string | null {
  if (!url || url === "NULL") return null;
  if (url.startsWith("/")) return url;

  for (const pattern of WP_UPLOAD_PATTERNS) {
    if (pattern.test(url)) {
      const path = url.replace(pattern, "").replace(/^\//, "");
      return `${assetsBase()}/${path}`;
    }
  }

  return url;
}
