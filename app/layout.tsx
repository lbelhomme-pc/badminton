import type { Metadata } from "next";
import "./globals.css";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { PwaInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { Providers } from "@/components/providers";
import { getSiteUrl } from "@/lib/seo";
import { getPublicClubSettings } from "@/services/club.service";

export const revalidate = 60;

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "CFVV - Club de badminton à Vendôme",
    template: "%s | CFVV"
  },
  description:
    "Site du Club des fous du Volants Vendômois : créneaux, agenda, inscriptions, réservations, volants et espace adhérent.",
  alternates: {
    canonical: "/"
  },
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
    title: "CFVV",
    statusBarStyle: "default"
  },
  openGraph: {
    title: "CFVV - Club de badminton à Vendôme",
    description: "Créneaux, agenda, inscriptions et vie du Club des fous du Volants Vendômois.",
    url: "/",
    siteName: "CFVV",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/logos/cfvv-illustration.png",
        width: 1200,
        height: 630,
        alt: "CFVV - Club des fous du Volants Vendômois"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "CFVV - Club de badminton à Vendôme",
    description: "Créneaux, agenda, inscriptions et vie du Club des fous du Volants Vendômois.",
    images: ["/logos/cfvv-illustration.png"]
  }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getPublicClubSettings();

  return (
    <html lang="fr">
      <body>
        <Providers>
          <a href="#main-content" className="skip-link">
            Aller au contenu
          </a>
          <SiteHeader appearance={settings.appearance} content={settings.content} />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <SiteFooter settings={settings} />
          <PwaInstallPrompt />
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
