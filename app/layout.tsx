import type { Metadata } from "next";
import "./globals.css";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { PwaInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "CFVV41 - Planning, réservations et vie du club",
  description:
    "Site moderne du Club des fous du Volant Vendômois (CFVV41) : créneaux, réservations, volants, inscriptions, classements et espace adhérent.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/pwa-icon.svg",
    apple: "/pwa-icon.svg"
  },
  appleWebApp: {
    capable: true,
    title: "CFVV41",
    statusBarStyle: "default"
  },
  openGraph: {
    title: "CFVV41",
    description: "Réservez vos créneaux et suivez la vie du CFVV41.",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Providers>
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
          <PwaInstallPrompt />
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
