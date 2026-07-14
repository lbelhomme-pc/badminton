export type MediaKind = "image" | "document";
export type MediaStatus = "active" | "archived";

export const mediaBucketName = "cfvv-public-media";

const allowedImageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"]);
const allowedDocumentMimeTypes = new Set(["application/pdf"]);
const maxMediaSizeBytes = 8 * 1024 * 1024;

export function sanitizeMediaFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/-\./g, ".")
    .replace(/^[-.]+|[-.]+$/g, "")
    .toLowerCase();
}

export function getMediaKind(mimeType: string): MediaKind | null {
  if (allowedImageMimeTypes.has(mimeType)) return "image";
  if (allowedDocumentMimeTypes.has(mimeType)) return "document";
  return null;
}

export function isAllowedPublicMediaFile(input: { mimeType: string; sizeBytes: number }) {
  return Boolean(getMediaKind(input.mimeType)) && input.sizeBytes > 0 && input.sizeBytes <= maxMediaSizeBytes;
}

export function validateMediaAssetInput(input: {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  title: string;
  informative: boolean;
  altText?: string | null;
}) {
  const cleanName = sanitizeMediaFileName(input.fileName);
  const kind = getMediaKind(input.mimeType);
  const issues: string[] = [];

  if (!input.title.trim()) issues.push("Titre obligatoire.");
  if (!cleanName) issues.push("Nom de fichier invalide.");
  if (!isAllowedPublicMediaFile({ mimeType: input.mimeType, sizeBytes: input.sizeBytes })) {
    issues.push("Type ou taille de fichier non autorise.");
  }
  if (kind === "image" && input.informative && !input.altText?.trim()) {
    issues.push("Texte alternatif obligatoire pour une image informative.");
  }

  return { ok: issues.length === 0, cleanName, kind, issues };
}

export function canDeleteMediaAsset(input: { knownUsage?: string[] | null; status?: MediaStatus | string | null }) {
  const usages = input.knownUsage?.filter(Boolean) ?? [];

  if (usages.length > 0) {
    return { ok: false, message: `Suppression bloquee : media utilise dans ${usages.join(", ")}.` };
  }

  if (input.status !== "archived") {
    return { ok: false, message: "Archive le media avant suppression definitive." };
  }

  return { ok: true, message: "Suppression autorisee." };
}
