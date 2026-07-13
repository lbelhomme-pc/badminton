import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CFVV - Club des Fous du Volant du Vendômois",
    short_name: "CFVV",
    description: "Planning, réservations et espace adhérent du CFVV.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F6FAFB",
    theme_color: "#1D1D1F",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/pwa-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/pwa-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/pwa-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
