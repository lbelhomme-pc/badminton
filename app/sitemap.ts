import type { MetadataRoute } from "next";
import { absoluteUrl, publicSitemapPaths } from "@/lib/seo";

const priorities: Record<(typeof publicSitemapPaths)[number], number> = {
  "/": 1,
  "/creneaux": 0.9,
  "/agenda": 0.8,
  "/tarifs": 0.8,
  "/contact": 0.8,
  "/vie-du-club/actualites": 0.7,
  "/vie-du-club/partenaires": 0.6,
  "/partenaires": 0.7,
  "/devenir-partenaire": 0.6,
  "/club/gymnases-acces": 0.8,
  "/lieux-acces": 0.8,
  "/inscriptions/seance-essai": 0.8,
  "/mentions-legales": 0.3,
  "/confidentialite": 0.3,
  "/cookies": 0.2,
  "/accessibilite": 0.2
};

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicSitemapPaths.map((path) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: path === "/" || path === "/vie-du-club/actualites" ? "weekly" : "monthly",
    priority: priorities[path]
  }));
}
