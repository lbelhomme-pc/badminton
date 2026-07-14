"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Dumbbell,
  MapPin,
  SlidersHorizontal,
  UsersRound,
  XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  dayKeyFromDate,
  filterSlots,
  getPublicSlotStatus,
  uniqueNormalizedOptions,
  type PublicSlotStatus,
  type SlotFilters
} from "@/lib/public-planning";
import { cn, formatDate, formatTime, slotTypeLabel } from "@/lib/utils";
import type { SlotOccurrence, SlotType } from "@/types/domain";

interface PublicCreneauxBoardProps {
  slots: SlotOccurrence[];
  onlyOpen?: boolean;
}

const dayFormatter = new Intl.DateTimeFormat("fr-FR", { weekday: "long" });

const typeOptions: Array<{ value: SlotType | "all"; label: string }> = [
  { value: "all", label: "Tous les types" },
  { value: "free_play", label: "Jeu libre" },
  { value: "youth_training", label: "Jeunes" },
  { value: "adult_training", label: "Adultes" },
  { value: "competitive_training", label: "Compétiteurs" },
  { value: "beginner_course", label: "Débutants" },
  { value: "interclub", label: "Interclubs" },
  { value: "tournament", label: "Tournoi" },
  { value: "camp", label: "Stage" },
  { value: "special_event", label: "Événement" }
];

const statusConfig: Record<PublicSlotStatus, { label: string; variant: "success" | "warning" | "danger" | "info"; icon: typeof CheckCircle2 }> = {
  usual: { label: "Habituel", variant: "success", icon: CheckCircle2 },
  modified: { label: "Modifié", variant: "warning", icon: AlertTriangle },
  exceptionally_closed: { label: "Fermé exceptionnellement", variant: "danger", icon: XCircle },
  school_holiday: { label: "Vacances scolaires", variant: "info", icon: CalendarDays },
  full: { label: "Complet", variant: "warning", icon: UsersRound }
};

function dayLabel(value: string) {
  return dayFormatter.format(new Date(value));
}

function SelectField({
  label,
  value,
  onChange,
  children
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-court-900">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-lg border border-court-200 bg-white px-3 text-base font-medium text-ink-700 outline-none transition focus:border-court-500 focus:ring-2 focus:ring-court-100"
      >
        {children}
      </select>
    </label>
  );
}

export function PublicCreneauxBoard({ slots, onlyOpen = false }: PublicCreneauxBoardProps) {
  const [filters, setFilters] = useState<SlotFilters>({ type: "all" });

  const visibleBaseSlots = useMemo(() => {
    if (!onlyOpen) return slots;
    return slots.filter((slot) => slot.status === "open");
  }, [onlyOpen, slots]);

  const filteredSlots = useMemo(() => filterSlots(visibleBaseSlots, filters), [filters, visibleBaseSlots]);
  const audiences = useMemo(() => uniqueNormalizedOptions(visibleBaseSlots.map((slot) => slot.audience)), [visibleBaseSlots]);
  const levels = useMemo(() => uniqueNormalizedOptions(visibleBaseSlots.map((slot) => slot.recommendedLevel)), [visibleBaseSlots]);
  const venues = useMemo(() => uniqueNormalizedOptions(visibleBaseSlots.map((slot) => slot.venueName)), [visibleBaseSlots]);
  const days = useMemo(
    () =>
      uniqueNormalizedOptions(visibleBaseSlots.map((slot) => dayLabel(slot.startsAt))).map((label) => ({
        label,
        value: dayKeyFromDate(visibleBaseSlots.find((slot) => dayLabel(slot.startsAt) === label)?.startsAt ?? "")
      })),
    [visibleBaseSlots]
  );

  function updateFilter<Key extends keyof SlotFilters>(key: Key, value: SlotFilters[Key] | "") {
    setFilters((current) => ({
      ...current,
      [key]: value || undefined
    }));
  }

  const hasActiveFilters = Boolean(filters.audience || filters.day || filters.level || (filters.type && filters.type !== "all") || filters.venue);

  return (
    <section aria-labelledby="creneaux-list-title">
      <Card className="mb-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 font-display text-sm font-bold uppercase text-court-600">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Filtres
            </p>
            <h2 id="creneaux-list-title" className="mt-2 text-2xl font-black text-court-900">
              Trouver le bon créneau
            </h2>
          </div>
          {hasActiveFilters ? (
            <Button variant="ghost" onClick={() => setFilters({ type: "all" })}>
              Réinitialiser
            </Button>
          ) : null}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <SelectField label="Public" value={filters.audience ?? ""} onChange={(value) => updateFilter("audience", value)}>
            <option value="">Tous les publics</option>
            {audiences.map((audience) => (
              <option key={audience} value={audience}>
                {audience}
              </option>
            ))}
          </SelectField>

          <SelectField label="Niveau" value={filters.level ?? ""} onChange={(value) => updateFilter("level", value)}>
            <option value="">Tous les niveaux</option>
            {levels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </SelectField>

          <SelectField label="Jour" value={filters.day ?? ""} onChange={(value) => updateFilter("day", value)}>
            <option value="">Tous les jours</option>
            {days.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </SelectField>

          <SelectField label="Type" value={filters.type ?? "all"} onChange={(value) => updateFilter("type", value as SlotType | "all")}>
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>

          <SelectField label="Lieu" value={filters.venue ?? ""} onChange={(value) => updateFilter("venue", value)}>
            <option value="">Tous les lieux</option>
            {venues.map((venue) => (
              <option key={venue} value={venue}>
                {venue}
              </option>
            ))}
          </SelectField>
        </div>
      </Card>

      {filteredSlots.length > 0 ? (
        <div className="grid gap-4">
          {filteredSlots.map((slot) => (
            <SlotPublicCard key={slot.id} slot={slot} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Aucun créneau ne correspond aux filtres"
          text="Essaie d'élargir le public, le jour ou le type de pratique. Le club peut aussi confirmer un créneau adapté via le formulaire de contact."
          action={
            <Link href="/contact">
              <Button variant="outline">Contacter le club</Button>
            </Link>
          }
        />
      )}
    </section>
  );
}

function SlotPublicCard({ slot }: { slot: SlotOccurrence }) {
  const publicStatus = getPublicSlotStatus(slot);
  const status = statusConfig[publicStatus];
  const StatusIcon = status.icon;
  const isClosed = publicStatus === "exceptionally_closed" || publicStatus === "school_holiday";
  const canReserve = slot.isReservable === true && !isClosed && publicStatus !== "full";

  return (
    <Card className={cn("p-5", isClosed ? "border-red-200 bg-red-50/40" : "bg-white")}>
      <div className="grid gap-5 lg:grid-cols-[180px_1fr_250px] lg:items-start">
        <div className="rounded-lg bg-court-50 p-4">
          <p className="font-display text-xl font-black capitalize text-court-900">{dayLabel(slot.startsAt)}</p>
          <p className="mt-2 flex items-center gap-2 text-sm font-bold text-ink-700">
            <Clock className="h-4 w-4 text-court-500" aria-hidden="true" />
            {formatTime(slot.startsAt)} - {formatTime(slot.endsAt)}
          </p>
          <p className="mt-1 text-sm text-ink-600">{formatDate(slot.startsAt, "short")}</p>
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={status.variant} icon={<StatusIcon className="h-3.5 w-3.5" />}>
              {status.label}
            </Badge>
            <Badge variant="neutral" icon={<UsersRound className="h-3.5 w-3.5" />}>
              {slot.audience}
            </Badge>
            <Badge variant="info" icon={<Dumbbell className="h-3.5 w-3.5" />}>
              {slotTypeLabel(slot.type)}
            </Badge>
          </div>

          <h3 className="mt-4 text-2xl font-black text-court-900">{slot.title}</h3>
          <p className="mt-2 text-sm leading-6 text-ink-600">{slot.recommendedLevel}</p>

          <div className="mt-4 grid gap-3 text-sm text-ink-700 sm:grid-cols-2">
            <p>
              <span className="font-bold text-court-900">Encadrant :</span> {slot.managerName || "à confirmer"}
            </p>
            <p>
              <span className="font-bold text-court-900">Terrains :</span> {slot.courtsCount || "à confirmer"}
            </p>
            <p>
              <span className="font-bold text-court-900">Période :</span> {slot.validFrom || slot.validUntil ? `${slot.validFrom ?? "début"} - ${slot.validUntil ?? "fin"}` : "saison en cours"}
            </p>
          </div>

          <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-ink-600">
            <MapPin className="mt-1 h-4 w-4 shrink-0 text-court-500" aria-hidden="true" />
            <span>
              <strong className="text-court-900">{slot.venueName}</strong>
              <br />
              {slot.address || "Adresse à confirmer par le club."}
            </span>
          </p>

          {slot.cancellationReason ? <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{slot.cancellationReason}</p> : null}
          {slot.practicalInfo ? <p className="mt-4 rounded-lg bg-court-50 px-4 py-3 text-sm leading-6 text-ink-700">{slot.practicalInfo}</p> : null}
        </div>

        <div className="grid gap-3">
          {canReserve ? (
            <Link href="/connexion">
              <Button variant="secondary" className="w-full">
                Réserver
              </Button>
            </Link>
          ) : null}
          <Link href="/lieux-acces" className="text-center font-display text-sm font-bold text-court-600 hover:text-court-900 hover:underline">
            Voir le plan d'accès
          </Link>
        </div>
      </div>
    </Card>
  );
}

