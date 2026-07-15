import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { AccessibilityInit } from "@/components/AccessibilityInit";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Providers } from "@/components/Providers";
import { A11Y_COOKIE, parseA11yCookie, resolveHtmlAttrs } from "@/lib/accessibility";

export const metadata: Metadata = {
  title: "ESITEF Online",
  description: "Formación online y presencial — plataforma migrada",
  icons: {
    icon: "https://esitef.com/online/wp-content/uploads/2026/05/Esitef_logo_icon_preloadeer.png",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark light",
};

/** Sync data-theme from cookie before paint (must match SSR + resolveHtmlAttrs). */
const THEME_BOOT_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )esitef-a11y=([^;]*)/);var prefs=m?JSON.parse(decodeURIComponent(m[1])):{theme:"system"};var t=prefs.theme||"system";document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","system");}})();`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const a11yCookie = cookieStore.get(A11Y_COOKIE)?.value ?? null;
  const a11yPrefs = parseA11yCookie(a11yCookie);
  const htmlAttrs = resolveHtmlAttrs(a11yPrefs);

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
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>
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
