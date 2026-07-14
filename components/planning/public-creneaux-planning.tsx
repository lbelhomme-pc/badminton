"use client";

import { useEffect, useState } from "react";
import { PublicCreneauxBoard } from "@/components/planning/public-creneaux-board";
import { Card } from "@/components/ui/card";
import { creneauxToSlotOccurrences } from "@/lib/creneau-slots";
import { formatTime, slotTypeLabel } from "@/lib/utils";
import { fetchPublicCreneaux } from "@/services/supabase-data.service";
import type { SlotOccurrence } from "@/types/domain";

interface PublicCreneauxPlanningProps {
  fallbackSlots: SlotOccurrence[];
  showWeeklySummary?: boolean;
  onlyOpen?: boolean;
}

export function PublicCreneauxPlanning({ fallbackSlots, showWeeklySummary = false, onlyOpen = false }: PublicCreneauxPlanningProps) {
  const [slots, setSlots] = useState(fallbackSlots);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicCreneaux().then((result) => {
      if (result.data.length > 0) {
        setSlots(creneauxToSlotOccurrences(result.data));
        setMessage(null);
      } else if (result.error && result.error !== "Configuration Supabase manquante.") {
        setMessage(result.error);
      }
    });
  }, []);

  return (
    <>
      {message ? <p className="mb-6 rounded-lg bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-800">{message}</p> : null}
      {showWeeklySummary ? <WeeklySummary slots={slots} /> : null}
      <PublicCreneauxBoard slots={slots} onlyOpen={onlyOpen} />
    </>
  );
}

function WeeklySummary({ slots }: { slots: SlotOccurrence[] }) {
  return (
    <Card className="mb-8 p-6">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Semaine type</p>
          <h2 className="mt-2 text-2xl font-black text-court-900">Créneaux habituels</h2>
          <p className="mt-3 text-sm leading-6 text-ink-500">
            Ces horaires viennent de l'administration quand Supabase est configuré. Les disponibilités réelles sont affichées juste après.
          </p>
        </div>
        <div className="grid gap-3">
          {slots.map((slot) => {
            const dayLabel = new Intl.DateTimeFormat("fr-FR", { weekday: "long" }).format(new Date(slot.startsAt));

            return (
              <div
                key={slot.id}
                className="grid gap-3 rounded-lg border border-court-200 bg-court-50 p-4 md:grid-cols-[120px_150px_1fr_150px]"
              >
                <p className="font-black capitalize text-court-900">{dayLabel}</p>
                <p className="font-semibold text-ink-700">
                  {formatTime(slot.startsAt)} - {formatTime(slot.endsAt)}
                </p>
                <div>
                  <p className="font-black text-court-900">{slot.title}</p>
                  <p className="mt-1 text-sm text-ink-500">
                    {slotTypeLabel(slot.type)} ? {slot.audience} ? {slot.venueName}
                  </p>
                  <p className="mt-1 text-sm text-ink-500">Responsable : {slot.managerName}</p>
                </div>
                <p className="rounded-lg bg-white px-3 py-2 text-center text-sm font-black text-court-700">
                  {slot.isReservable ? "Réservable" : "Sans réservation"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

