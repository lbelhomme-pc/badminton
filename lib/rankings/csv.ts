export interface CsvRankingInput {
  playerKeySeed: string;
  displayName: string;
  categorie: string | null;
  classementSimple: string | null;
  classementDouble: string | null;
  classementMixte: string | null;
  pointsSimple: number | null;
  pointsDouble: number | null;
  pointsMixte: number | null;
  progression: string | null;
  equipe: string | null;
}

const headerAliases: Record<string, string[]> = {
  licence: ["licence", "numero_licence", "num_licence", "n_licence", "license", "ffbad_id", "id_ffbad"],
  nom: ["nom", "lastname", "last_name"],
  prenom: ["prenom", "prénom", "firstname", "first_name"],
  joueur: ["joueur", "nom_prenom", "nom prénom", "name", "display_name"],
  categorie: ["categorie", "catégorie", "category"],
  simple: ["simple", "simple_homme", "simple_dame", "sh", "sd", "classement_simple", "rank_simple"],
  double: ["double", "double_homme", "double_dame", "dh", "dd", "classement_double", "rank_double"],
  mixte: ["mixte", "double_mixte", "mx", "classement_mixte", "rank_mixte", "rank_mixed"],
  pointsSimple: ["points_simple", "cote_simple", "pts_simple", "simple_points"],
  pointsDouble: ["points_double", "cote_double", "pts_double", "double_points"],
  pointsMixte: ["points_mixte", "cote_mixte", "pts_mixte", "mixed_points"],
  progression: ["progression", "progress", "evolution", "évolution"],
  equipe: ["equipe", "équipe", "team"]
};

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function parseCsv(text: string) {
  const delimiter = detectDelimiter(text);
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === delimiter && !inQuotes) {
      row.push(current.trim());
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(current.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  row.push(current.trim());
  if (row.some(Boolean)) rows.push(row);

  return rows;
}

function detectDelimiter(text: string) {
  const firstLine = text.split(/\r?\n/).find(Boolean) ?? "";
  const semicolons = (firstLine.match(/;/g) ?? []).length;
  const commas = (firstLine.match(/,/g) ?? []).length;
  return semicolons >= commas ? ";" : ",";
}

function getValue(record: Record<string, string>, key: keyof typeof headerAliases) {
  for (const alias of headerAliases[key]) {
    const normalized = normalizeHeader(alias);
    if (record[normalized]) return record[normalized].trim();
  }
  return "";
}

function toNumber(value: string) {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function publicDisplayName(prenom: string, nom: string, joueur: string) {
  if (prenom || nom) {
    const initial = nom ? `${nom.trim()[0]?.toUpperCase()}.` : "";
    return [prenom.trim(), initial].filter(Boolean).join(" ");
  }

  const parts = joueur.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return joueur.trim();

  const first = parts[0];
  const last = parts.slice(1).join(" ");
  return `${first} ${last[0]?.toUpperCase()}.`;
}

export function parseRankingsCsv(text: string): CsvRankingInput[] {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];

  const headers = rows[0].map(normalizeHeader);

  return rows.slice(1).flatMap((row) => {
    const record = Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""]));
    const licence = getValue(record, "licence");
    const nom = getValue(record, "nom");
    const prenom = getValue(record, "prenom");
    const joueur = getValue(record, "joueur");
    const displayName = publicDisplayName(prenom, nom, joueur);

    if (!displayName) return [];

    return [
      {
        playerKeySeed: licence || [prenom, nom, joueur, getValue(record, "categorie")].filter(Boolean).join("|"),
        displayName,
        categorie: getValue(record, "categorie") || null,
        classementSimple: getValue(record, "simple") || "NC",
        classementDouble: getValue(record, "double") || "NC",
        classementMixte: getValue(record, "mixte") || "NC",
        pointsSimple: toNumber(getValue(record, "pointsSimple")),
        pointsDouble: toNumber(getValue(record, "pointsDouble")),
        pointsMixte: toNumber(getValue(record, "pointsMixte")),
        progression: getValue(record, "progression") || null,
        equipe: getValue(record, "equipe") || null
      }
    ];
  });
}
