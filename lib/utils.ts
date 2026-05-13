import type { SlotStatus, SlotType } from "@/types/domain";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function formatDate(value: string, mode: "short" | "long" = "long") {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: mode === "long" ? "long" : "short",
    day: "numeric",
    month: mode === "long" ? "long" : "short"
  }).format(new Date(value));
}

export function formatEuros(cents: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR"
  }).format(cents / 100);
}

export function slotTypeLabel(type: SlotType) {
  const labels: Record<SlotType, string> = {
    free_play: "Jeu libre",
    youth_training: "Jeunes",
    adult_training: "Adultes",
    competitive_training: "Compétiteurs",
    beginner_course: "Débutants",
    interclub: "Interclubs",
    tournament: "Tournoi",
    camp: "Stage",
    special_event: "Événement"
  };

  return labels[type];
}

export function slotStatusLabel(status: SlotStatus) {
  const labels: Record<SlotStatus, string> = {
    open: "Ouvert",
    full: "Complet",
    cancelled: "Annulé",
    competition_reserved: "Réservé compétition",
    closed: "Fermé"
  };

  return labels[status];
}

export function slotStatusClass(status: SlotStatus) {
  const classes: Record<SlotStatus, string> = {
    open: "border-emerald-200 bg-emerald-50 text-emerald-700",
    full: "border-orange-200 bg-orange-50 text-orange-700",
    cancelled: "border-red-200 bg-red-50 text-red-700",
    competition_reserved: "border-blue-200 bg-blue-50 text-blue-700",
    closed: "border-slate-200 bg-slate-100 text-slate-600"
  };

  return classes[status];
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
