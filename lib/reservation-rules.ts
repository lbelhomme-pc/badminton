export interface ReservationRuleInput {
  reservationActive: boolean;
  isCancelled: boolean;
  opensAt: string | null;
  closesAt: string | null;
  placesLeft: number | null;
  alreadyReserved: boolean;
  alreadyWaiting: boolean;
}

export type ReservationActionState =
  | "already_reserved"
  | "already_waiting"
  | "closed_exceptionally"
  | "reservation_disabled"
  | "not_open_yet"
  | "closed"
  | "waitlist_available"
  | "reservable";

export interface CancellationRuleInput {
  status: string;
  cancellationDeadlineAt?: string | null;
}

export function getReservationActionState(input: ReservationRuleInput, now = new Date()): ReservationActionState {
  if (input.alreadyReserved) return "already_reserved";
  if (input.alreadyWaiting) return "already_waiting";
  if (input.isCancelled) return "closed_exceptionally";
  if (!input.reservationActive) return "reservation_disabled";
  if (input.opensAt && now < new Date(input.opensAt)) return "not_open_yet";
  if (input.closesAt && now >= new Date(input.closesAt)) return "closed";
  if (input.placesLeft === 0) return "waitlist_available";
  return "reservable";
}

export function reservationActionLabel(state: ReservationActionState) {
  switch (state) {
    case "already_reserved":
      return "Annuler ma réservation";
    case "already_waiting":
      return "Déjà en attente";
    case "closed_exceptionally":
      return "Fermé exceptionnellement";
    case "reservation_disabled":
      return "Réservation désactivée";
    case "not_open_yet":
      return "Pas encore ouverte";
    case "closed":
      return "Réservation fermée";
    case "waitlist_available":
      return "Rejoindre la liste d'attente";
    default:
      return "Réserver";
  }
}

export function canCancelReservation(input: CancellationRuleInput, now = new Date()) {
  if (input.status === "annulee" || input.status === "refusee") return false;
  if (!input.cancellationDeadlineAt) return true;
  return now < new Date(input.cancellationDeadlineAt);
}

export function buildReservationCsv(rows: Array<Record<string, unknown>>) {
  const headers = ["date", "creneau", "heure", "lieu", "adherent", "email", "statut"];
  const escape = (value: string | number | null | undefined) => {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  };
  const textValue = (value: unknown) => (typeof value === "string" || typeof value === "number" ? value : undefined);
  const stringValue = (value: unknown) => (typeof value === "string" ? value : undefined);

  return [
    headers.map(escape).join(";"),
    ...rows.map((row) => {
      const creneau = row.creneaux && typeof row.creneaux === "object" ? row.creneaux as Record<string, unknown> : null;
      const heureDebut = stringValue(creneau?.heure_debut)?.slice(0, 5);
      const heureFin = stringValue(creneau?.heure_fin)?.slice(0, 5);

      return [
        textValue(row.date) ?? textValue(row.date_reservation),
        textValue(row.creneau) ?? textValue(creneau?.jour),
        textValue(row.heure) ?? [heureDebut, heureFin].filter(Boolean).join(" - "),
        textValue(row.lieu) ?? textValue(creneau?.gymnase),
        textValue(row.adherent) ?? textValue(row.member_name),
        textValue(row.email) ?? textValue(row.member_email),
        textValue(row.statut)
      ].map(escape).join(";");
    })
  ].join("\n");
}
