import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CF2V41 - Club des fous du Volant Vendômois",
    short_name: "CF2V41",
    description: "Planning, réservations et espace adhérent du CF2V41.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F7F9F7",
    theme_color: "#10201B",
    orientation: "portrait",
    icons: [
      {
        src: "/pwa-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable"
      }
    ]
  };
}
