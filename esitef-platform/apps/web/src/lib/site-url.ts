/** Public base URL for links and assets in emails. */
export function getPublicSiteUrl(): string {
  return (
    process.env.AUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://app.esitef.com"
  ).replace(/\/$/, "");
}

/** Absolute URL for ESITEF icon in email `<img>` (must be HTTPS + publicly reachable). */
export function getEmailLogoUrl(siteUrl = getPublicSiteUrl()): string {
  return `${siteUrl.replace(/\/$/, "")}/img/Esitef_logo_icon_preloadeer.png`;
}
