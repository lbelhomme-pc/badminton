"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PublicCreneauxBoard } from "@/components/planning/public-creneaux-board";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { creneauxToSlotOccurrences } from "@/lib/creneau-slots";
import { formatTime } from "@/lib/utils";
import { fetchPublicCreneaux } from "@/services/supabase-data.service";
import type { SlotOccurrence } from "@/types/domain";

interface PublicCreneauxPlanningProps {
  fallbackSlots: SlotOccurrence[];
  showWeeklySummary?: boolean;
  showDetailedBoard?: boolean;
  onlyOpen?: boolean;
}

export function PublicCreneauxPlanning({
  fallbackSlots,
  showWeeklySummary = false,
  showDetailedBoard = true,
  onlyOpen = false
}: PublicCreneauxPlanningProps) {
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
      {showDetailedBoard ? <PublicCreneauxBoard slots={slots} onlyOpen={onlyOpen} /> : null}
    </>
  );
}

const weekDays = [
  { key: "mardi", label: "Mardi" },
  { key: "mercredi", label: "Mercredi" },
  { key: "jeudi", label: "Jeudi" },
  { key: "vendredi", label: "Vendredi" }
];

function normalizeWeeklyText(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function dayKey(slot: SlotOccurrence) {
  return normalizeWeeklyText(new Intl.DateTimeFormat("fr-FR", { weekday: "long" }).format(new Date(slot.startsAt)));
}

function isYouthSlot(slot: SlotOccurrence) {
  const text = normalizeWeeklyText(`${slot.title} ${slot.audience} ${slot.type}`);
  return text.includes("jeune") || text.includes("youth");
}

function formatSlotRanges(slots: SlotOccurrence[]) {
  const ranges = Array.from(
    new Set(
      [...slots]
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
        .map((slot) => `${formatTime(slot.startsAt)} - ${formatTime(slot.endsAt)}`)
    )
  );

  return ranges.length > 0 ? ranges.join(", ") : "—";
}

function WeeklySummary({ slots }: { slots: SlotOccurrence[] }) {
  const rows = weekDays.map((day) => {
    const daySlots = slots.filter((slot) => dayKey(slot) === day.key);
    const youthSlots = daySlots.filter(isYouthSlot);
    const adultSlots = daySlots.filter((slot) => !isYouthSlot(slot));

    return {
      ...day,
      youth: formatSlotRanges(youthSlots),
      adults: formatSlotRanges(adultSlots),
      reservation: day.key === "mercredi" || day.key === "vendredi" ? "Sur réservation" : "Sans réservation"
    };
  });

  return (
    <Card className="mb-8 p-6">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-court-600">Semaine type</p>
          <h2 className="mt-2 text-2xl font-black text-court-900">Horaires habituels</h2>
          <p className="mt-3 text-sm leading-6 text-ink-500">
            Avant de venir, vérifie les horaires, le lieu du créneau et les éventuelles modalités de réservation.
          </p>
          <p className="mt-3 rounded-lg bg-court-50 px-4 py-3 text-sm font-semibold leading-6 text-court-800">
            Les créneaux du mercredi et du vendredi sont accessibles sur réservation depuis l'espace adhérent.
          </p>
          <div className="mt-5 flex flex-col gap-3">
            <Link href="/connexion">
              <Button className="w-full">Se connecter pour réserver</Button>
            </Link>
            <Link href="/inscriptions/seance-essai">
              <Button variant="outline" className="w-full">Demander un essai</Button>
            </Link>
          </div>
        </div>

        <div>
          <div className="hidden overflow-hidden rounded-lg border border-court-200 md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-court-50 text-court-900">
                <tr>
                  <th scope="col" className="px-4 py-3 font-display text-base font-black">Jour</th>
                  <th scope="col" className="px-4 py-3 font-display text-base font-black">Entraînement jeunes</th>
                  <th scope="col" className="px-4 py-3 font-display text-base font-black">Entraînement adultes</th>
                  <th scope="col" className="px-4 py-3 font-display text-base font-black">Modalité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-court-100">
                {rows.map((row) => (
                  <tr key={row.key} className="bg-white">
                    <th scope="row" className="px-4 py-4 font-black text-court-900">{row.label}</th>
                    <td className="px-4 py-4 text-ink-700">{row.youth}</td>
                    <td className="px-4 py-4 text-ink-700">{row.adults}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-court-50 px-3 py-1 text-xs font-black uppercase text-court-800">{row.reservation}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {rows.map((row) => (
              <div key={row.key} className="rounded-lg border border-court-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-black text-court-900">{row.label}</h3>
                  <span className="rounded-full bg-court-50 px-3 py-1 text-xs font-black uppercase text-court-800">{row.reservation}</span>
                </div>
                <div className="mt-4 grid gap-3 text-sm leading-6 text-ink-700">
                  <p><span className="font-bold text-court-900">Jeunes :</span> {row.youth}</p>
                  <p><span className="font-bold text-court-900">Adultes :</span> {row.adults}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

