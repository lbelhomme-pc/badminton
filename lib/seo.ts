export const defaultSiteUrl = "https://badminton-orcin.vercel.app";

export const publicSitemapPaths = [
  "/",
  "/creneaux",
  "/tarifs",
  "/contact",
  "/vie-du-club/actualites",
  "/club/gymnases-acces",
  "/inscriptions/seance-essai",
  "/mentions-legales",
  "/confidentialite"
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
