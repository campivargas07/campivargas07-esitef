import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "ESITEF Online",
  description: "Formación online y presencial — plataforma migrada",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
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
