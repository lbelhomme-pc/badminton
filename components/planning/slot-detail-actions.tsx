"use client";

import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SlotOccurrence } from "@/types/domain";

export function SlotDetailActions({ slot }: { slot: SlotOccurrence }) {
  const remaining = Math.max(slot.capacityMax - slot.registeredCount, 0);
  const canReserve = slot.status === "open" && remaining > 0;

  return (
    <div className="rounded-lg border border-court-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-ink-500">Places restantes</p>
          <p className="text-4xl font-black text-court-900">{remaining}</p>
        </div>
        <div className="text-right text-sm font-medium text-ink-500">
          <p>{slot.registeredCount}/{slot.capacityMax} inscrits</p>
          <p>{slot.courtsCount} terrains disponibles</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        {canReserve ? (
          <Link
            href="/reservation-creneau"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-court-500 px-5 text-sm font-semibold text-white shadow-soft transition hover:bg-court-600"
          >
            Réserver ma place
          </Link>
        ) : (
          <span className="inline-flex h-12 items-center justify-center rounded-lg bg-ink-100 px-5 text-sm font-semibold text-ink-500">
            Créneau indisponible
          </span>
        )}
        <Button variant="outline" size="lg">
          <CalendarPlus className="h-4 w-4" aria-hidden="true" />
          Ajouter
        </Button>
      </div>
      <p className="mt-4 rounded-lg bg-court-100 px-3 py-2 text-sm font-medium text-ink-600">
        Annulation possible en ligne jusqu'à 6 heures avant le début du créneau.
      </p>
    </div>
  );
}
