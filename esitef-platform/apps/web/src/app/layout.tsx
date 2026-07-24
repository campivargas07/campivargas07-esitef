import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import Script from "next/script";
import "./globals.css";
import { AccessibilityInit } from "@/components/AccessibilityInit";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Providers } from "@/components/Providers";
import { A11Y_COOKIE, parseA11yCookie, resolveHtmlAttrs, THEME_FORCE_LIGHT } from "@/lib/accessibility";
import { SITE_FONTS_STYLESHEET } from "@/lib/site-fonts";

const siteUrl =
  process.env.AUTH_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://app.esitef.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "ESITEF Online",
  description: "Formación online y presencial — plataforma migrada",
  icons: {
    icon: "/img/Esitef_logo_icon_preloadeer.png",
  },
  openGraph: {
    type: "website",
    siteName: "ESITEF",
    locale: "es_ES",
    images: [{ url: "/img/Esitef_logo_icon_preloadeer.png" }],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#ffffff",
  viewportFit: "cover",
};

const THEME_BOOT_SCRIPT = THEME_FORCE_LIGHT
  ? `document.documentElement.setAttribute("data-theme","light");`
  : `(function(){try{var d=window.matchMedia("(prefers-color-scheme: dark)").matches;var m=document.cookie.match(/(?:^|; )esitef-a11y=([^;]*)/);var p=m?JSON.parse(decodeURIComponent(m[1])):{theme:"light"};var t=p.theme||"light";if(t==="system"||!t)t=d?"dark":"light";document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme",window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");}})();`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const a11yCookie = cookieStore.get(A11Y_COOKIE)?.value ?? null;
  const a11yPrefs = parseA11yCookie(a11yCookie);
  const chScheme = (await headers()).get("sec-ch-prefers-color-scheme");
  const osPrefersDark =
    chScheme === "dark" ? true : chScheme === "light" ? false : null;
  const htmlAttrs = resolveHtmlAttrs(a11yPrefs, osPrefersDark);

  return (
    <html
      lang="es"
      data-theme={htmlAttrs["data-theme"]}
      data-contrast={htmlAttrs["data-contrast"]}
      data-font-scale={htmlAttrs["data-font-scale"]}
      data-vision={htmlAttrs["data-vision"]}
      data-motion={htmlAttrs["data-motion"]}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={SITE_FONTS_STYLESHEET} rel="stylesheet" />
      </head>
      <body>
        <Script id="esitef-theme-boot" strategy="beforeInteractive">
          {THEME_BOOT_SCRIPT}
        </Script>
        <svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
          <defs>
            <filter id="protanopia-filter">
              <feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0" />
            </filter>
            <filter id="deuteranopia-filter">
              <feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0" />
            </filter>
            <filter id="deuteranomaly-filter">
              <feColorMatrix type="matrix" values="0.8,0.2,0,0,0 0.258,0.742,0,0,0 0,0.142,0.858,0,0 0,0,0,1,0" />
            </filter>
          </defs>
        </svg>
        <AccessibilityInit cookieValue={a11yCookie} />
        <Providers>
          <div className="site-wrapper">
            <SiteHeader />
            <main id="content">{children}</main>
            <SiteFooter />
          </div>
          {process.env.NODE_ENV === "development" && (
            <div className="staging-banner">
              ENTORNO DE DESARROLLO — Pagos en sandbox
            </div>
          )}
        </Providers>
      </body>
    </html>
  );
}
