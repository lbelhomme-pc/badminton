export interface PageContentOverride {
  eyebrow?: string;
  title?: string;
  intro?: string;
  body?: string;
  imageUrl?: string;
  imageAlt?: string;
}

export const editablePublicPages = [
  { key: "/club", label: "Le club" },
  { key: "/club/presentation", label: "Présentation du club" },
  { key: "/club/bureau-benevoles", label: "Bureau et bénévoles" },
  { key: "/club/encadrants", label: "Encadrants" },
  { key: "/club/gymnases-acces", label: "Gymnases et accès" },
  { key: "/contact", label: "Contact" },
  { key: "/devenir-partenaire", label: "Devenir partenaire" },
  { key: "/faq", label: "Questions fréquentes" },
  { key: "/inscriptions/tarifs", label: "Tarifs" },
  { key: "/inscriptions/documents-utiles", label: "Documents utiles" },
  { key: "/inscriptions/seance-essai", label: "Séance d'essai" },
  { key: "/inscriptions/licence-ffbad", label: "Licence FFBaD" },
  { key: "/jouer-au-club", label: "Jouer au club" },
  { key: "/jouer-au-club/adultes-debutants", label: "Adultes débutants" },
  { key: "/jouer-au-club/competition", label: "Compétition" },
  { key: "/jouer-au-club/creneaux", label: "Créneaux du club", bodyEditable: false },
  { key: "/jouer-au-club/jeunes", label: "Jeunes" },
  { key: "/jouer-au-club/loisirs", label: "Loisirs" },
  { key: "/reservations", label: "Réservations" },
  { key: "/vie-du-club", label: "Vie du club" },
  { key: "/vie-du-club/actualites", label: "Actualités" },
  { key: "/vie-du-club/evenements", label: "Événements", bodyEditable: false },
  { key: "/vie-du-club/interclubs", label: "Interclubs" },
  { key: "/vie-du-club/partenaires", label: "Partenaires" },
  { key: "/vie-du-club/tournois", label: "Tournois" }
] as const;

export type EditablePublicPageKey = (typeof editablePublicPages)[number]["key"];

export function pageEditorId(pageKey: string) {
  return `page-${pageKey.replace(/^\/+/, "").replace(/[^a-z0-9]+/gi, "-") || "accueil"}`;
}
