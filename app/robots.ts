import type { MetadataRoute } from "next";
import { absoluteUrl, getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/espace-adherent",
          "/espace-adherent/",
          "/compte",
          "/compte/",
          "/mes-reservations",
          "/mes-reservations/",
          "/reservation-creneau",
          "/reservation-creneau/",
          "/commande-volants",
          "/commande-volants/",
          "/documents",
          "/documents/"
        ]
      }
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: getSiteUrl()
  };
}
