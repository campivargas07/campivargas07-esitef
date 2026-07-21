/** Public base URL for links and assets in emails. */
export function getPublicSiteUrl(): string {
  return (
    process.env.AUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://app.esitef.com"
  ).replace(/\/$/, "");
}
