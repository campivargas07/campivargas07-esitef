import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.AUTH_URL ??
  "https://esitef.com";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/aprender", "/dashboard", "/ingresar"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
