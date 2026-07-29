/** Public base URL for links and assets in emails. */
export function getPublicSiteUrl(): string {
  return (
    process.env.AUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://esitef.com"
  ).replace(/\/$/, "");
}

const EMAIL_LOGO_LIGHT = "/img/Esitef_logo_icon_preloadeer.png";
const EMAIL_LOGO_DARK = "/img/Esitef_logo_icon_dark.png";

/** Absolute URL for ESITEF icon in email `<img>` (must be HTTPS + publicly reachable). */
export function getEmailLogoUrl(siteUrl = getPublicSiteUrl()): string {
  return `${siteUrl.replace(/\/$/, "")}${EMAIL_LOGO_LIGHT}`;
}

/** White logo variant for dark email backgrounds (aligned with navbar dark filter). */
export function getEmailLogoDarkUrl(siteUrl = getPublicSiteUrl()): string {
  return `${siteUrl.replace(/\/$/, "")}${EMAIL_LOGO_DARK}`;
}
