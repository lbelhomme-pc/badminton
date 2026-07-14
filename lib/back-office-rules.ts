import { hasAppRole, normalizeAppRoles, type AppRole } from "@/lib/roles";
import { isAllowedPrivateDocumentFile, sanitizePrivateDocumentFileName } from "@/lib/private-documents";

export type BackOfficeAction =
  | "edit_content"
  | "publish_content"
  | "archive_content"
  | "restore_content"
  | "delete_permanently"
  | "manage_members"
  | "manage_admins"
  | "import_members"
  | "manage_media"
  | "view_audit_logs";

export type ContentStatus = "brouillon" | "programme" | "publie" | "archive" | "corbeille";
export type ContentAction = "publish" | "unpublish" | "schedule" | "archive" | "restore" | "trash" | "delete_permanently";

export interface CsvImportRow {
  email: string;
  prenom: string;
  nom: string;
  licence_ffbad?: string;
  role: AppRole;
}

export interface MemberCsvPreviewOptions {
  existingEmails?: string[];
  existingLicences?: string[];
  pendingInvitationEmails?: string[];
}

export interface CsvImportIssue {
  row: number;
  field: string;
  message: string;
}

const requiredMemberCsvColumns = ["email", "prenom", "nom"] as const;
const optionalMemberCsvColumns = ["licence_ffbad", "role"] as const;

export function canPerformBackOfficeAction(roles: AppRole[], action: BackOfficeAction) {
  const normalized = normalizeAppRoles(roles);

  if (hasAppRole(normalized, "super_admin")) return true;

  if (action === "manage_admins" || action === "delete_permanently" || action === "view_audit_logs") {
    return hasAppRole(normalized, "admin");
  }

  if (action === "manage_members" || action === "import_members") {
    return hasAppRole(normalized, "admin");
  }

  return hasAppRole(normalized, "manager") || hasAppRole(normalized, "admin");
}

export function nextContentStatus(current: ContentStatus, action: ContentAction, scheduledAt?: string | null): ContentStatus | null {
  if (action === "publish") return "publie";
  if (action === "schedule") return scheduledAt ? "programme" : null;
  if (action === "unpublish") return current === "publie" || current === "programme" ? "brouillon" : null;
  if (action === "archive") return current === "corbeille" ? null : "archive";
  if (action === "restore") return current === "archive" || current === "corbeille" ? "brouillon" : null;
  if (action === "trash") return current === "corbeille" ? null : "corbeille";
  if (action === "delete_permanently") return current === "corbeille" ? "corbeille" : null;
  return null;
}

function normalizeEmail(value: string | null | undefined) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeLicence(value: string | null | undefined) {
  return String(value ?? "").trim().toLowerCase();
}

function splitCsvLine(line: string, separator: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === separator && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function detectCsvSeparator(headerLine: string) {
  return headerLine.includes(";") ? ";" : ",";
}

export function parseMemberCsvPreview(csv: string, options: MemberCsvPreviewOptions = {}) {
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const issues: CsvImportIssue[] = [];

  if (lines.length === 0) {
    return { rows: [] as CsvImportRow[], issues: [{ row: 0, field: "fichier", message: "Fichier CSV vide." }] };
  }

  const separator = detectCsvSeparator(lines[0]);
  const headers = splitCsvLine(lines[0], separator).map((header) => header.trim().toLowerCase());
  requiredMemberCsvColumns.forEach((column) => {
    if (!headers.includes(column)) {
      issues.push({ row: 1, field: column, message: `Colonne obligatoire manquante : ${column}.` });
    }
  });

  const allowedColumns = new Set<string>([...requiredMemberCsvColumns, ...optionalMemberCsvColumns]);
  headers.forEach((header) => {
    if (!allowedColumns.has(header)) {
      issues.push({ row: 1, field: header, message: `Colonne non reconnue : ${header}.` });
    }
  });

  const rows: CsvImportRow[] = [];
  const emails = new Set<string>();
  const licences = new Set<string>();
  const existingEmails = new Set((options.existingEmails ?? []).map(normalizeEmail).filter(Boolean));
  const existingLicences = new Set((options.existingLicences ?? []).map(normalizeLicence).filter(Boolean));
  const pendingInvitationEmails = new Set((options.pendingInvitationEmails ?? []).map(normalizeEmail).filter(Boolean));

  lines.slice(1).forEach((line, index) => {
    const rowNumber = index + 2;
    const values = splitCsvLine(line, separator);
    const record = Object.fromEntries(headers.map((header, valueIndex) => [header, values[valueIndex] ?? ""]));
    const email = normalizeEmail(String(record.email ?? ""));
    const licence = normalizeLicence(String(record.licence_ffbad ?? ""));
    const role = normalizeAppRoles([record.role || "member"])[0];

    if (!email || !email.includes("@")) {
      issues.push({ row: rowNumber, field: "email", message: "Email invalide." });
    }

    if (emails.has(email)) {
      issues.push({ row: rowNumber, field: "email", message: "Doublon dans le fichier CSV." });
    }
    emails.add(email);

    if (existingEmails.has(email)) {
      issues.push({ row: rowNumber, field: "email", message: "Email deja present dans les adherents." });
    }

    if (pendingInvitationEmails.has(email)) {
      issues.push({ row: rowNumber, field: "email", message: "Invitation deja en attente pour cet email." });
    }

    if (licence) {
      if (licences.has(licence)) {
        issues.push({ row: rowNumber, field: "licence_ffbad", message: "Doublon de licence dans le fichier CSV." });
      }
      if (existingLicences.has(licence)) {
        issues.push({ row: rowNumber, field: "licence_ffbad", message: "Licence deja presente dans les adherents." });
      }
      licences.add(licence);
    }

    if (!record.prenom) {
      issues.push({ row: rowNumber, field: "prenom", message: "Prénom manquant." });
    }

    if (!record.nom) {
      issues.push({ row: rowNumber, field: "nom", message: "Nom manquant." });
    }

    rows.push({
      email,
      prenom: String(record.prenom ?? ""),
      nom: String(record.nom ?? ""),
      licence_ffbad: licence || undefined,
      role
    });
  });

  return { rows, issues };
}

export function validateMediaUpload(input: { fileName: string; mimeType: string; sizeBytes: number; informative: boolean; altText?: string }) {
  const cleanName = sanitizePrivateDocumentFileName(input.fileName);
  const issues: string[] = [];

  if (!cleanName) issues.push("Nom de fichier invalide.");
  if (!isAllowedPrivateDocumentFile({ mimeType: input.mimeType, sizeBytes: input.sizeBytes })) {
    issues.push("Type ou taille de fichier non autorisé.");
  }
  if (input.informative && !input.altText?.trim()) {
    issues.push("Texte alternatif obligatoire pour une image informative.");
  }

  return { ok: issues.length === 0, cleanName, issues };
}
