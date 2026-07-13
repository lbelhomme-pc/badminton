import { normalizeAppRoles, type AppRole } from "@/lib/roles";

export const privateDocumentCategories = [
  "saison",
  "reglement",
  "assemblee_generale",
  "bureau",
  "equipe",
  "contact",
  "formulaire",
  "autre"
] as const;

export type PrivateDocumentCategory = (typeof privateDocumentCategories)[number];

export const privateDocumentCategoryLabels: Record<PrivateDocumentCategory, string> = {
  saison: "Saison",
  reglement: "Règlement",
  assemblee_generale: "Assemblée générale",
  bureau: "Bureau",
  equipe: "Équipe",
  contact: "Contacts utiles",
  formulaire: "Formulaires",
  autre: "Autre"
};

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png"
]);

export function canAccessPrivateDocument(userRoles: AppRole[], allowedRoles: string[] | null | undefined) {
  const roles = normalizeAppRoles(userRoles);
  const allowed = allowedRoles?.filter(Boolean) ?? [];

  if (roles.includes("admin") || roles.includes("super_admin") || roles.includes("manager")) return true;
  if (allowed.length === 0) return roles.includes("member");

  return allowed.some((role) => roles.includes(role as AppRole));
}

export function isAllowedPrivateDocumentFile(input: { mimeType: string; sizeBytes: number }) {
  const maxSizeBytes = 15 * 1024 * 1024;
  return allowedMimeTypes.has(input.mimeType) && input.sizeBytes > 0 && input.sizeBytes <= maxSizeBytes;
}

export function sanitizePrivateDocumentFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/-\./g, ".")
    .replace(/^[-.]+|[-.]+$/g, "")
    .toLowerCase();
}
