import type { ClubEvent, ClubEventCategory, SlotOccurrence, SlotType } from "@/types/domain";

export type PublicSlotStatus = "usual" | "modified" | "exceptionally_closed" | "school_holiday" | "full";

export interface SlotFilters {
  audience?: string;
  day?: string;
  level?: string;
  type?: SlotType | "all";
  venue?: string;
}

export interface EventFilters {
  category?: ClubEventCategory | "all";
}

const dayFormatter = new Intl.DateTimeFormat("fr-FR", { weekday: "long" });

export function normalizeSearchValue(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function dayKeyFromDate(value: string) {
  return normalizeSearchValue(dayFormatter.format(new Date(value)));
}

export function uniqueNormalizedOptions(values: Array<string | null | undefined>) {
  const seen = new Set<string>();
  return values
    .map((value) => (value ?? "").trim())
    .filter(Boolean)
    .filter((value) => {
      const key = normalizeSearchValue(value);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function getPublicSlotStatus(slot: SlotOccurrence): PublicSlotStatus {
  if (slot.status === "cancelled") return "exceptionally_closed";
  if (slot.status === "closed") return "school_holiday";
  if (slot.capacityMax > 0 && slot.registeredCount >= slot.capacityMax) return "full";
  if (slot.status === "competition_reserved") return "modified";
  return "usual";
}

export function filterSlots(slots: SlotOccurrence[], filters: SlotFilters) {
  return slots.filter((slot) => {
    const matchesAudience = !filters.audience || normalizeSearchValue(slot.audience) === normalizeSearchValue(filters.audience);
    const matchesLevel = !filters.level || normalizeSearchValue(slot.recommendedLevel).includes(normalizeSearchValue(filters.level));
    const matchesDay = !filters.day || dayKeyFromDate(slot.startsAt) === normalizeSearchValue(filters.day);
    const matchesType = !filters.type || filters.type === "all" || slot.type === filters.type;
    const matchesVenue = !filters.venue || normalizeSearchValue(slot.venueName) === normalizeSearchValue(filters.venue);

    return matchesAudience && matchesLevel && matchesDay && matchesType && matchesVenue;
  });
}

export function validateSlot(slot: SlotOccurrence) {
  const errors: string[] = [];
  if (!slot.id) errors.push("id manquant");
  if (!slot.title) errors.push("titre manquant");
  if (!slot.startsAt || Number.isNaN(new Date(slot.startsAt).getTime())) errors.push("date de début invalide");
  if (!slot.endsAt || Number.isNaN(new Date(slot.endsAt).getTime())) errors.push("date de fin invalide");
  if (slot.startsAt && slot.endsAt && new Date(slot.endsAt) <= new Date(slot.startsAt)) errors.push("heure de fin avant le début");
  if (!slot.audience) errors.push("public manquant");
  if (!slot.recommendedLevel) errors.push("niveau manquant");
  if (!slot.venueName) errors.push("lieu manquant");
  return errors;
}

export function eventCategoryLabel(category: ClubEventCategory) {
  const labels: Record<ClubEventCategory, string> = {
    competition: "Compétition",
    club_event: "Événement club",
    meeting: "Réunion",
    camp: "Stage",
    closure: "Fermeture",
    birthday: "Anniversaire"
  };

  return labels[category];
}

export function filterEvents(events: ClubEvent[], filters: EventFilters) {
  return events.filter((event) => !filters.category || filters.category === "all" || event.category === filters.category);
}

export function isEventVisible(event: ClubEvent, now = new Date()) {
  if (event.status === "draft") return false;
  if (event.status === "scheduled") {
    return event.scheduledFor ? new Date(event.scheduledFor) <= now : false;
  }
  return event.status === "published" || event.status === "cancelled";
}

export function getUpcomingPublicEvents(events: ClubEvent[], now = new Date()) {
  return events
    .filter((event) => isEventVisible(event, now))
    .filter((event) => new Date(event.endsAt ?? event.startsAt) >= now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function getNextPublicEvents(events: ClubEvent[], limit = 3, now = new Date()) {
  return getUpcomingPublicEvents(events, now).slice(0, limit);
}

export function validateEvent(event: ClubEvent) {
  const errors: string[] = [];
  if (!event.id) errors.push("id manquant");
  if (!event.title) errors.push("titre manquant");
  if (!event.startsAt || Number.isNaN(new Date(event.startsAt).getTime())) errors.push("date de début invalide");
  if (event.endsAt && new Date(event.endsAt) <= new Date(event.startsAt)) errors.push("date de fin avant le début");
  if (!event.description) errors.push("description manquante");
  if (event.status === "scheduled" && !event.scheduledFor) errors.push("date de publication programmee manquante");
  if (event.status === "cancelled" && !event.cancellationMessage) errors.push("message d'annulation manquant");
  return errors;
}

function escapeIcsText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function formatIcsDate(value: string) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function generateEventIcs(event: ClubEvent, siteUrl: string) {
  const end = event.endsAt ?? new Date(new Date(event.startsAt).getTime() + 60 * 60 * 1000).toISOString();
  const status = event.status === "cancelled" ? "CANCELLED" : "CONFIRMED";
  const url = `${siteUrl.replace(/\/+$/, "")}/vie-du-club/evenements#${encodeURIComponent(event.id)}`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CFVV//Agenda//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@cfvv`,
    `DTSTAMP:${formatIcsDate(new Date().toISOString())}`,
    `DTSTART:${formatIcsDate(event.startsAt)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.cancellationMessage ? `${event.cancellationMessage}\n\n${event.description}` : event.description)}`,
    event.venueName ? `LOCATION:${escapeIcsText(event.venueName)}` : null,
    `STATUS:${status}`,
    `URL:${url}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ]
    .filter(Boolean)
    .join("\r\n");
}

