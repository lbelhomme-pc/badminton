"use client";

import { Filter, LayoutGrid, List, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { SlotCard } from "@/components/planning/slot-card";
import { slotTypeLabel } from "@/lib/utils";
import type { SlotOccurrence, SlotType } from "@/types/domain";

interface PlanningExperienceProps {
  slots: SlotOccurrence[];
  onlyOpen?: boolean;
}

export function PlanningExperience({ slots, onlyOpen = false }: PlanningExperienceProps) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<SlotType | "all">("all");
  const [view, setView] = useState<"list" | "calendar">("list");

  const types = useMemo(() => {
    return Array.from(new Set(slots.map((slot) => slot.type)));
  }, [slots]);

  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      const haystack = `${slot.title} ${slot.venueName} ${slot.recommendedLevel} ${slot.audience}`.toLowerCase();
      const matchesQuery = haystack.includes(query.toLowerCase());
      const matchesType = type === "all" || slot.type === type;
      const matchesOpen = !onlyOpen || slot.status === "open";
      return matchesQuery && matchesType && matchesOpen;
    });
  }, [onlyOpen, query, slots, type]);

  const grouped = useMemo(() => {
    return filteredSlots.reduce<Record<string, SlotOccurrence[]>>((groups, slot) => {
      groups[slot.date] = groups[slot.date] ?? [];
      groups[slot.date].push(slot);
      return groups;
    }, {});
  }, [filteredSlots]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-court-200 bg-white p-3 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <label className="relative block">
            <span className="sr-only">Rechercher un créneau</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 w-full rounded-lg border border-court-200 bg-court-50 pl-10 pr-3 text-sm font-medium outline-none transition focus:border-court-500 focus:bg-white focus:ring-2 focus:ring-court-500/20"
              placeholder="Rechercher par lieu, niveau, responsable..."
            />
          </label>

          <div className="flex gap-2 overflow-x-auto">
            <button
              className={`h-11 shrink-0 rounded-full border px-4 text-sm font-semibold transition ${
                type === "all" ? "border-court-500 bg-court-500 text-white" : "border-court-200 bg-white text-ink-500"
              }`}
              onClick={() => setType("all")}
            >
              Tous
            </button>
            {types.map((slotType) => (
              <button
                key={slotType}
                className={`h-11 shrink-0 rounded-full border px-4 text-sm font-semibold transition ${
                  type === slotType ? "border-court-500 bg-court-500 text-white" : "border-court-200 bg-white text-ink-500"
                }`}
                onClick={() => setType(slotType)}
              >
                {slotTypeLabel(slotType)}
              </button>
            ))}
          </div>

          <div className="flex rounded-lg border border-court-200 bg-court-50 p-1">
            <button
              className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold ${
                view === "list" ? "bg-white text-court-900 shadow-sm" : "text-ink-500"
              }`}
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4" aria-hidden="true" />
              Liste
            </button>
            <button
              className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold ${
                view === "calendar" ? "bg-white text-court-900 shadow-sm" : "text-ink-500"
              }`}
              onClick={() => setView("calendar")}
            >
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
              Semaine
            </button>
          </div>
        </div>
        <p className="mt-3 flex items-center gap-2 text-sm font-medium text-ink-500">
          <Filter className="h-4 w-4" aria-hidden="true" />
          {filteredSlots.length} créneau{filteredSlots.length > 1 ? "x" : ""} affiché{filteredSlots.length > 1 ? "s" : ""}
        </p>
      </div>

      {filteredSlots.length === 0 ? (
        <EmptyState
          title="Aucun créneau trouvé"
          text="Essayez de retirer un filtre ou de choisir une autre recherche."
        />
      ) : view === "list" ? (
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, daySlots]) => (
            <section key={date} className="space-y-3">
              <h2 className="text-xl font-black capitalize text-court-900">
                {new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date(daySlots[0].startsAt))}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {daySlots.map((slot) => (
                  <SlotCard key={slot.id} slot={slot} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredSlots.map((slot) => (
            <SlotCard key={slot.id} slot={slot} compact />
          ))}
        </div>
      )}
    </div>
  );
}
