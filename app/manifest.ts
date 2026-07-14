import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CFVV - Club des fous du Volants Vendômois",
    short_name: "CFVV",
    description: "Planning, réservations et espace adhérent du CFVV.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#A5D7DE",
    theme_color: "#0C8A9C",
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
