export const defaultSiteUrl = "https://badminton-orcin.vercel.app";

export const publicSitemapPaths = [
  "/",
  "/creneaux",
  "/agenda",
  "/tarifs",
  "/contact",
  "/vie-du-club/actualites",
  "/vie-du-club/partenaires",
  "/partenaires",
  "/devenir-partenaire",
  "/club/gymnases-acces",
  "/lieux-acces",
  "/inscriptions/seance-essai",
  "/mentions-legales",
  "/confidentialite",
  "/cookies",
  "/accessibilite"
] as const;

export function getSiteUrl() {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim() || defaultSiteUrl;
  return value.replace(/\/+$/, "");
}

export function absoluteUrl(path: string) {
  return new URL(path, `${getSiteUrl()}/`).toString();
}

export function canonical(path: string) {
  return {
    canonical: absoluteUrl(path)
  };
}
