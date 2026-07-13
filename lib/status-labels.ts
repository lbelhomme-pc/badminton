const reservationStatusLabels: Record<string, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  annulee: "Annulée",
  refusee: "Refusée"
};

const waitingListStatusLabels: Record<string, string> = {
  en_attente: "En attente",
  notifiee: "Place à confirmer avec le club",
  reservee: "Réservée",
  annulee: "Annulée"
};

const shuttleOrderStatusLabels: Record<string, string> = {
  demandee: "Demandée",
  validee: "Validée",
  payee: "Payée",
  remise: "Remise",
  annulee: "Annulée"
};

const clubRoleLabels: Record<string, string> = {
  adherent: "Adhérent",
  entraineur: "Entraîneur",
  bureau: "Bureau",
  admin: "Admin"
};

const seasonStatusLabels: Record<string, string> = {
  actif: "Actif",
  en_attente: "En attente",
  inactif: "Suspendu",
  suspendu: "Suspendu",
  ancien: "Non renouvelé",
  non_renouvele: "Non renouvelé"
};

function fallbackLabel(value: string) {
  const normalized = value.replace(/_/g, " ").trim();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function reservationStatusLabel(status: string) {
  return reservationStatusLabels[status] ?? fallbackLabel(status);
}

export function waitingListStatusLabel(status: string) {
  return waitingListStatusLabels[status] ?? fallbackLabel(status);
}

export function shuttleOrderStatusLabel(status: string) {
  return shuttleOrderStatusLabels[status] ?? fallbackLabel(status);
}

export function clubRoleLabel(role: string) {
  return clubRoleLabels[role] ?? fallbackLabel(role);
}

export function seasonStatusLabel(status: string) {
  return seasonStatusLabels[status] ?? fallbackLabel(status);
}
