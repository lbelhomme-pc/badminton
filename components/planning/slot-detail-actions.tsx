"use client";

import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClub } from "@/hooks/use-club-store";
import type { SlotOccurrence } from "@/types/domain";

export function SlotDetailActions({ slot }: { slot: SlotOccurrence }) {
  const { reserveSlot, placesTakenForSlot } = useClub();
  const [message, setMessage] = useState<string | null>(null);
  const remaining = Math.max(slot.capacityMax - slot.registeredCount - placesTakenForSlot(slot.id), 0);
  const canReserve = slot.status === "open" && remaining > 0;

  function onReserve() {
    const result = reserveSlot(slot);
    setMessage(result.ok ? "Réservation confirmée. Le créneau est ajouté à votre espace adhérent." : result.message);
  }

  return (
    <div className="rounded-lg border border-court-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-ink-500">Places restantes</p>
          <p className="text-4xl font-black text-court-900">{remaining}</p>
        </div>
        <div className="text-right text-sm font-medium text-ink-500">
          <p>{slot.registeredCount + placesTakenForSlot(slot.id)}/{slot.capacityMax} inscrits</p>
          <p>{slot.courtsCount} terrains disponibles</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <Button size="lg" disabled={!canReserve} onClick={onReserve}>
          {canReserve ? "Réserver ma place" : "Créneau indisponible"}
        </Button>
        <Button variant="outline" size="lg">
          <CalendarPlus className="h-4 w-4" aria-hidden="true" />
          Ajouter
        </Button>
      </div>
      <p className="mt-4 rounded-lg bg-court-100 px-3 py-2 text-sm font-medium text-ink-600">
        Annulation possible en ligne jusqu'à 6 heures avant le début du créneau.
      </p>
      {message ? <p className="mt-3 text-sm font-bold text-court-600" aria-live="polite">{message}</p> : null}
    </div>
  );
}
