import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CFVV - Club des fous du Volants Vendômois",
    short_name: "CFVV",
    description: "Planning, réservations et espace adhérent du CFVV.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#031D2B",
    theme_color: "#031D2B",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/pwa-icon-192-v2.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/pwa-icon-512-v2.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/pwa-icon-512-v2.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
