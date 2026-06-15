import type { Metadata } from "next";
import "./globals.css";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { PwaInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { Providers } from "@/components/providers";
import { getSiteUrl } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "CF2V41 - Planning, réservations et vie du club",
  description:
    "Site moderne du Club des fous du Volant Vendômois (CF2V41) : créneaux, réservations, volants, inscriptions, classements et espace adhérent.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/pwa-icon-192.png", sizes: "192x192", type: "image/png" }
    ],
    apple: "/icons/apple-touch-icon.png"
  },
  appleWebApp: {
    capable: true,
    title: "CF2V41",
    statusBarStyle: "default"
  },
  openGraph: {
    title: "CF2V41",
    description: "Réservez vos créneaux et suivez la vie du CF2V41.",
    url: "/",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Providers>
          <a href="#main-content" className="skip-link">
            Aller au contenu
          </a>
          <SiteHeader />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <SiteFooter />
          <PwaInstallPrompt />
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
