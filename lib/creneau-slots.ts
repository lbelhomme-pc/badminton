import type { CreneauRow } from "@/services/supabase-data.service";
import type { SlotOccurrence, SlotType } from "@/types/domain";

const dayIndexes: Record<string, number> = {
  dimanche: 0,
  lundi: 1,
  mardi: 2,
  mercredi: 3,
  jeudi: 4,
  vendredi: 5,
  samedi: 6
};

function normalizeDay(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function nextDateForDay(day: string) {
  const target = dayIndexes[normalizeDay(day)] ?? 1;
  const now = new Date();
  const date = new Date();
  const daysUntilTarget = (target - now.getDay() + 7) % 7;

  date.setDate(now.getDate() + daysUntilTarget);
  date.setHours(12, 0, 0, 0);

  return date.toISOString().slice(0, 10);
}

function withTime(date: string, time: string) {
  return new Date(`${date}T${time.slice(0, 8)}`).toISOString();
}

function mapCreneauType(creneau: CreneauRow): SlotType {
  const type = creneau.type.toLowerCase();
  const audience = creneau.public.toLowerCase();

  if (type.includes("competition")) return "competitive_training";
  if (type.includes("jeunes") || audience.includes("jeunes")) return "youth_training";
  if (type.includes("adultes") || type.includes("entrainement") || type.includes("entraînement")) return "adult_training";

  return "free_play";
}

function titleForCreneau(creneau: CreneauRow) {
  const type = mapCreneauType(creneau);
  if (type === "youth_training") return "Entraînement jeunes";
  if (type === "adult_training") return "Entraînement adultes";
  if (type === "competitive_training") return "Créneau compétition";

  const audience = creneau.public && creneau.public !== "tous" ? ` ${creneau.public}` : "";
  return `Jeu libre${audience}`;
}

export function creneauxToSlotOccurrences(creneaux: CreneauRow[]): SlotOccurrence[] {
  return creneaux
    .filter((creneau) => creneau.actif)
    .map((creneau) => {
      const date = nextDateForDay(creneau.jour);
      const capacity = creneau.places_max ?? 28;

      return {
        id: `creneau-${creneau.id}`,
        title: titleForCreneau(creneau),
        type: mapCreneauType(creneau),
        date,
        startsAt: withTime(date, creneau.heure_debut),
        endsAt: withTime(date, creneau.heure_fin),
        venueId: creneau.gymnase.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        venueName: creneau.gymnase,
        address: creneau.adresse ?? "",
        managerName: creneau.responsable ?? "Responsable créneau à confirmer",
        recommendedLevel: creneau.niveau ?? creneau.public,
        audience: creneau.public,
        courtsCount: 7,
        capacityMax: capacity,
        registeredCount: 0,
        status: "open" as const
      };
    })
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function creneauIdFromSlotId(slotId: string) {
  const match = /^creneau-(\d+)$/.exec(slotId);
  return match ? Number(match[1]) : null;
}
